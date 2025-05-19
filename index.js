export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'POST') {
    return new Response('Use POST', { status: 405 });
  }

  const apiKey = '64729b3a-efcb-64be-bb64-685a9fd8a05b8dd3';

  // Read Lua script from incoming request body
  const luaCode = await request.text();

  // 1. Create new session
  const newScriptResp = await fetch('https://api.luaobfuscator.com/v1/obfuscator/newscript', {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'content-type': 'text'
    },
    body: luaCode
  });

  const newScriptData = await newScriptResp.json();

  if (!newScriptData.sessionId) {
    return new Response(JSON.stringify({ error: newScriptData.message || 'Failed to create session' }), { status: 500 });
  }

  const sessionId = newScriptData.sessionId;

  // 2. Obfuscate with plugins
  const obfuscateResp = await fetch('https://api.luaobfuscator.com/v1/obfuscator/obfuscate', {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'sessionId': sessionId,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      MinifyAll: true,
      CustomPlugins: { DummyFunctionArgs: [6, 9] }
    })
  });

  const obfuscateData = await obfuscateResp.json();

  if (!obfuscateData.code) {
    return new Response(JSON.stringify({ error: obfuscateData.message || 'Obfuscation failed' }), { status: 500 });
  }

  // Return the obfuscated code
  return new Response(obfuscateData.code, {
    headers: { 'content-type': 'text/plain' }
  });
}
