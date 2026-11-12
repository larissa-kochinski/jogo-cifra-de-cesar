export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const metodo = request.method;

  // Salvar grupo no banco
  if (metodo === "POST" && url.pathname.endsWith("/salvar")) {
    try {
      const { nome, fase, tempo, concluido } = await request.json();
      
      await env.jogo_criptografia.prepare(`
        INSERT OR REPLACE INTO grupos (nome, fase, tempo, concluido, ultima_atualizacao)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(nome, fase, tempo, concluido ? 1 : 0).run();
      
      return new Response(JSON.stringify({ sucesso: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (erro) {
      return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
  }

  // Buscar todos os grupos
  if (metodo === "GET") {
    try {
      const { results } = await env.jogo_criptografia.prepare(`
        SELECT * FROM grupos ORDER BY concluido DESC, tempo ASC, ultima_atualizacao ASC
      `).all();
      
      return new Response(JSON.stringify(results || []), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (erro) {
      return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
  }

  // Limpar todos os dados
  if (metodo === "POST" && url.pathname.endsWith("/limpar")) {
    try {
      await env.jogo_criptografia.prepare("DELETE FROM grupos").run();
      return new Response(JSON.stringify({ sucesso: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (erro) {
      return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
  }

  return new Response("Rota não encontrada", { status: 404 });
}
