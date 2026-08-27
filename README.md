# 📅 Agenda Amiga

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)

> Sua companheira para não esquecer nenhum compromisso!

**Agenda Amiga** é um aplicativo web simples e elegante para gerenciar compromissos como consultas médicas, reuniões de escola, eventos e reuniões de trabalho — tudo sincronizado na nuvem!

![Demo](https://via.placeholder.com/800x400/764ba2/ffffff?text=Agenda+Amiga+Demo)

## ✨ Funcionalidades

- 📅 **Categorias organizadas**: Médico 🏥, Escola 🎓, Reunião 💼, Evento 🎉
- 🔔 **Alertas automáticos**: Notificação diária a partir da 1h da manhã
- 🔊 **Alertas sonoros**: Melodia agradável ao receber lembretes
- 💬 **Balões informativos**: Tooltips e notificações visuais
- 🔥 **Destaque "HOJE"**: Eventos do dia com animação pulsante
- ☁️ **Sincronização em nuvem**: Seus dados salvos via JSONBin.io
- 💾 **Cache local**: Funciona mesmo offline
- 📱 **100% responsivo**: Funciona em celular, tablet e desktop
- 🎨 **Interface moderna**: Design limpo com gradientes e animações

## 🚀 Demonstração

Acesse a versão online pelo GitHub Pages:
👉 **[https://SEU-USUARIO.github.io/agenda-amiga](https://SEU-USUARIO.github.io/agenda-amiga)**

*(Substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub após publicar)*

## 🛠️ Tecnologias

- **HTML5** semântico
- **CSS3** com gradientes, animações e design responsivo
- **JavaScript** vanilla (sem frameworks)
- **JSONBin.io** para armazenamento em nuvem
- **LocalStorage** para cache offline

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/agenda-amiga.git
cd agenda-amiga
```

### 2. Configure suas credenciais da nuvem

Copie o arquivo de exemplo e edite com suas credenciais do [JSONBin.io](https://jsonbin.io):

```bash
cp config.example.js config.js
```

Edite `config.js`:

```javascript
const CLOUD_CONFIG = {
  binId: 'SEU_BIN_ID',
  masterKey: 'SUA_X_MASTER_KEY',
  baseUrl: 'https://api.jsonbin.io/v3/b'
};
```

### 3. Abra no navegador

Simplesmente abra o arquivo `index.html` no seu navegador favorito, ou use um servidor local:

```bash
# Com Python
python -m http.server 8000

# Com Node.js (npx)
npx serve
```

Acesse `http://localhost:8000`

## 🔐 Segurança

⚠️ **Importante**: O arquivo `config.js` contém suas credenciais e **já está no `.gitignore`** para não ser publicado acidentalmente.

Se você for fazer fork deste projeto:
1. Crie uma conta no [JSONBin.io](https://jsonbin.io)
2. Crie seu próprio Bin
3. Gere sua própria X-Master-Key
4. Copie `config.example.js` para `config.js` e preencha com seus dados

**Nunca compartilhe sua X-Master-Key publicamente!**

## 📖 Como usar

1. **Adicionar compromisso**: Preencha o formulário no topo com título, categoria, data, hora e descrição opcional
2. **Filtrar**: Use os botões para ver só os de hoje ou por categoria
3. **Sincronizar**: Os dados são salvos automaticamente na nuvem a cada alteração
4. **Alertas**: A partir da 1h da manhã, você receberá um balão com todos os compromissos do dia

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- 🐛 Reportar bugs abrindo uma *issue*
- 💡 Sugerir novas funcionalidades
- 🔧 Enviar *pull requests*
- 📚 Melhorar a documentação

## 📝 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [JSONBin.io](https://jsonbin.io) pelo serviço gratuito de API JSON
- Comunidade open source pela inspiração

## 📬 Contato

Criado com ❤️ por **[Seu Nome]**

- GitHub: [@SEU-USUARIO](https://github.com/SEU-USUARIO)
- Email: seu.email@exemplo.com

---

⭐ Se gostou do projeto, deixe uma estrela no GitHub!
