import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  const log = [];
  try {
    const base44 = createClientFromRequest(req);

    // Parse body
    let body;
    try {
      const rawBody = await req.text();
      body = JSON.parse(rawBody);
    } catch (e) {
      return Response.json({ error: 'Invalid JSON body: ' + e.message }, { status: 400 });
    }

    const { repoName, description, files, branch = 'main', commitMessage } = body;

    if (!repoName || !files || !Array.isArray(files)) {
      return Response.json({ error: 'repoName and files array are required' }, { status: 400 });
    }

    // Get GitHub token via service role connector
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection("github");
      accessToken = conn.accessToken;
      log.push('GitHub token obtained');
    } catch (e) {
      return Response.json({ error: 'Failed to get GitHub connection: ' + e.message, log }, { status: 500 });
    }

    const ghHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'FireCheck-Pro-Base44-Sync'
    };

    // Get authenticated user login (repo owner)
    const userRes = await fetch('https://api.github.com/user', { headers: ghHeaders });
    if (!userRes.ok) {
      const errText = await userRes.text();
      return Response.json({ error: 'Failed to get GitHub user', status: userRes.status, details: errText, log }, { status: 500 });
    }
    const userInfo = await userRes.json();
    const owner = userInfo.login;
    log.push('Owner: ' + owner);

    // Create public repo with auto_init to initialize with a README (ignore 422 if already exists)
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        name: repoName,
        description: description || 'Sistema FireCheck Pro',
        private: false,
        auto_init: true
      })
    });
    log.push('Create repo status: ' + createRes.status);

    // Wait for repo initialization to propagate
    if (createRes.ok) {
      await new Promise(r => setTimeout(r, 3000));
    }

    // Check if repo already has commits on the target branch
    let parentSha = null;
    let baseTreeSha = null;
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branch}`, { headers: ghHeaders });
    log.push('Ref check status: ' + refRes.status);
    if (refRes.ok) {
      const refData = await refRes.json();
      parentSha = refData.object.sha;
      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits/${parentSha}`, { headers: ghHeaders });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    } else if (refRes.status === 409) {
      // Repo is empty — initialize with first file via Contents API
      log.push('Repo empty, initializing via Contents API...');
      const firstFile = files[0];
      const initRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${firstFile.path}`, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({
          message: 'Inicialização do repositório',
          content: btoa(unescape(encodeURIComponent(firstFile.content)))
        })
      });
      if (!initRes.ok) {
        const errText = await initRes.text();
        return Response.json({ error: 'Failed to initialize repo', details: errText, log }, { status: 500 });
      }
      log.push('Repo initialized with first file');
      await new Promise(r => setTimeout(r, 2000));

      // Now get the ref and tree SHA
      const refRes2 = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branch}`, { headers: ghHeaders });
      if (refRes2.ok) {
        const refData2 = await refRes2.json();
        parentSha = refData2.object.sha;
        const commitRes2 = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits/${parentSha}`, { headers: ghHeaders });
        if (commitRes2.ok) {
          const commitData2 = await commitRes2.json();
          baseTreeSha = commitData2.tree.sha;
        }
      }
    }

    // Create tree with all files
    const treeItems = files.map(f => ({
      path: f.path,
      mode: '100644',
      type: 'blob',
      content: f.content
    }));

    const treeBody = { tree: treeItems };
    if (baseTreeSha) treeBody.base_tree = baseTreeSha;

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify(treeBody)
    });

    if (!treeRes.ok) {
      const errText = await treeRes.text();
      return Response.json({ error: 'Failed to create tree', status: treeRes.status, details: errText, log }, { status: 500 });
    }
    const treeData = await treeRes.json();
    log.push('Tree created: ' + treeData.sha);

    // Create commit
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        message: commitMessage || 'Preservação e versionamento do sistema FireCheck Pro',
        tree: treeData.sha,
        parents: parentSha ? [parentSha] : []
      })
    });

    if (!commitRes.ok) {
      const errText = await commitRes.text();
      return Response.json({ error: 'Failed to create commit', status: commitRes.status, details: errText, log }, { status: 500 });
    }
    const commitData = await commitRes.json();
    log.push('Commit created: ' + commitData.sha);

    // Update or create branch ref
    if (parentSha) {
      const patchRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers: ghHeaders,
        body: JSON.stringify({ sha: commitData.sha, force: true })
      });
      if (!patchRes.ok) {
        const errText = await patchRes.text();
        return Response.json({ error: 'Failed to update ref', details: errText, log }, { status: 500 });
      }
    } else {
      const refCreateRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
        method: 'POST',
        headers: ghHeaders,
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitData.sha })
      });
      if (!refCreateRes.ok) {
        const errText = await refCreateRes.text();
        return Response.json({ error: 'Failed to create ref', details: errText, log }, { status: 500 });
      }
    }
    log.push('Ref updated/created');

    // Set repo topics for discoverability
    try {
      await fetch(`https://api.github.com/repos/${owner}/${repoName}/topics`, {
        method: 'PUT',
        headers: { ...ghHeaders, Accept: 'application/vnd.github.mercy-preview+json' },
        body: JSON.stringify({
          names: ['firecheck', 'bombeiro-civil', 'vistoria-tecnica', 'prevencao-incendio', 'nbr', 'base44', 'cilo-imrea']
        })
      });
    } catch (e) {
      // Non-critical
    }

    return Response.json({
      success: true,
      repo_url: `https://github.com/${owner}/${repoName}`,
      owner,
      repo_name: repoName,
      files_pushed: files.length,
      commit_sha: commitData.sha,
      visibility: 'public',
      log
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack, log }, { status: 500 });
  }
}