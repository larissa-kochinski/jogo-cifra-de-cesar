export async function onRequestGet({ env }) {
  try {
    const { results } = await env.jogo_criptografia.prepare(
      "SELECT * FROM grupos ORDER BY concluido DESC, tempo ASC, ultima_atualizacao ASC"
    ).all();
    
    return new Response(JSON.stringify(results || []), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const url = new URL(request.url);
    const acao = url.searchParams.get('acao');
    const dados = await request.json();
    
    if (acao === 'salvar') {
      const { nome, fase, tempo, concluido } = dados;
      await env.jogo_criptografia.prepare(`
        INSERT OR REPLACE INTO grupos (nome, fase, tempo, concluido, ultima_atualizacao)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(nome, fase, tempo, concluido ? 1 : 0).run();
      
      return new Response(JSON.stringify({ sucesso: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (acao === 'limpar') {
  await env.jogo_criptografia.prepare("DELETE FROM grupos").run();
  return new Response(JSON.stringify({ sucesso: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
    
    return new Response(JSON.stringify({ erro: "Ação inválida" }), { status: 400 });
  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
  }
}
