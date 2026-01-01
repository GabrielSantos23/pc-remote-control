# Desktop Server - Modo de Teste

## Como Testar Sem Desligar o PC

### Modo de Teste (Padrão)

Por padrão, o servidor está configurado em **modo de teste** e **NÃO vai executar** os comandos de shutdown/restart/sleep de verdade.

Para iniciar o servidor em modo de teste:

```bash
cd apps/desktop-server
bun run dev
```

Você verá a mensagem:

```
Mode: 🧪 TEST MODE (commands will be simulated)
```

Quando você enviar comandos de shutdown, restart ou sleep, eles serão apenas **simulados** e aparecerão no console, mas **não vão desligar/reiniciar seu PC**.

### Modo de Produção

Quando estiver pronto para testar de verdade, edite o arquivo `.env` e mude:

```env
TEST_MODE=false
```

Você verá a mensagem:

```
Mode: ⚡ PRODUCTION MODE (commands will execute)
```

⚠️ **ATENÇÃO**: Neste modo, os comandos vão **realmente desligar/reiniciar seu PC**!

## Variáveis de Ambiente

Crie ou edite o arquivo `.env` em `apps/desktop-server/`:

```env
# Set to 'true' to enable test mode (commands won't actually execute)
TEST_MODE=true

# Port for the server
PORT=3000
```
