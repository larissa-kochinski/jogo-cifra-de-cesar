export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const metodo = request.method;

  // ✅ Salvar grupo no banco
  if (metodo === "POST" && url.pathname.endsWith("/salvar")) {
    const { nome, fase, tempo, concluido } = await request.json();
    
    await env.jogo_criptografia.prepare(`
      INSERT OR REPLACE INTO grupos (nome, fase, tempo, concluido, ultima_atualizacao)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(nome, fase, tempo, concluido ? 1 : 0).run();
    
    return new Response(JSON.stringify({ sucesso: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // 📖 Buscar todos os grupos
  if (metodo === "GET") {
    const { results } = await env.jogo_criptografia.prepare(`
      SELECT * FROM grupos ORDER BY concluido DESC, tempo ASC, ultima_atualizacao ASC
    `).all();
    
    return new Response(JSON.stringify(results || []), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // 🗑️ Limpar todos os dados
  if (metodo === "POST" && url.pathname.endsWith("/limpar")) {
    await env.jogo_criptografia.prepare("DELETE FROM grupos").run();
    return new Response(JSON.stringify({ sucesso: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response("Rota não encontrada", { status: 404 });
}
