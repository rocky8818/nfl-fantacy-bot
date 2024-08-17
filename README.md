### CHATBOT Whatsapp (Baileys Provider)

<p align="center">
  <img width="300" src="https://i.imgur.com/Oauef6t.png">
</p>


**Con esta librería, puedes construir flujos automatizados de conversación de manera agnóstica al proveedor de WhatsApp,** configurar respuestas automatizadas para preguntas frecuentes, recibir y responder mensajes de manera automatizada, y hacer un seguimiento de las interacciones con los clientes.  Además, puedes configurar fácilmente disparadores que te ayudaran a expandir las funcionalidades sin límites. **[Ver documentación](https://bot-whatsapp.netlify.app/)**


## To Run
- You need to setup your environment variables which are:
ASSISTANT_ID=
OPENAI_API_KEY=
ROWENA_IDENT=
API_URL=

- You need to modify the /mensajes/menu.txt That txt file is the message that will be sent at first when somenone sends you a message
- In the directory 'mensajes' you can create instruction to the chatgpt bot to read them and answer according to the information in that file. This repository sets the example with the products file as a .md

```
npm install
npm start
```

