const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const path = require("path")
const fs = require("fs")
const axios = require('axios')

const chat = require("./chatGPT")

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf8")

const introPath = path.join(__dirname, "mensajes", "introduccion.md")
const intro = fs.readFileSync(introPath, "utf8")

const pathConsultas = path.join(__dirname, "mensajes", "promptConsultas.md")
const promptConsultas = fs.readFileSync(pathConsultas, "utf8")


const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer('Este es el flow consultas')
    .addAnswer("Hace tu consulta", { capture: true }, async (ctx, ctxFn) => {
        const prompt = promptConsultas
        const consulta = ctx.body
        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)
    })

    const flowIntro = addKeyword(EVENTS.ACTION)
        .addAnswer(intro)

const flowProductos = addKeyword(EVENTS.ACTION)
    .addAnswer('Te enviaré los 3 productos que tenemos, cada uno es especial para distintas situaciones', 'Siéntete en confianza de preguntar especificamente sobre el que te interese.',{
        delay: 4000
    })
    .addAnswer('Nuestro primer bot es Rowena flow, ideal si tienes bien determinado las respuestas que quieres dar.', {
        media: 'https://i.pinimg.com/564x/6c/ae/9b/6cae9b731a26eeefdb3ae01be62f7d9b.jpg',
        delay: 2000
    })
    .addAnswer('El siguiente es Rowena personal assistant, nuestar opción 100% inteligente', {
        media: 'https://i.pinimg.com/564x/eb/52/af/eb52af485575ea64d0e6d722622dfc1a.jpg',
        delay: 2000
    })
    .addAnswer('Por último, tenemos a Rowena Hybrid, nuestar opción más completa, una mezcla de los dos bots anteriores.', {
        media: 'https://i.pinimg.com/736x/54/cc/8f/54cc8fb7ce3a4459a68de390569c496c.jpg',
        delay: 2000
    })
    .addAnswer('Si tienes alguna duda no dudes en preguntar en la opción 4 del menú', {
        delay: 2000
    })


const menuFlow = addKeyword(EVENTS.WELCOME).addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["1", "2", "3", "4", "0"].includes(ctx.body)) {
            return fallBack(
                "Respuesta no válida, por favor selecciona una de las opciones."
            );
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowIntro);
            case "2":
                return gotoFlow(flowProductos);
            case "3":
                return gotoFlow(flowReporte);
            case "4":
                return gotoFlow(flowConsultas);
            case "0":
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menú escribiendo '*Menu*'"
                );
        }
    }
);

    const flowReporte = addKeyword(['reporte'])
        .addAnswer(
            ['Hola 👋, sentimos que estés teniendo problemas, pero intentaremos resolverlo.', 'A continuación haremos unas preguntas ❔ para recaudar información de tu problema y atenderlo de la mejor manera.🧐']
        )
        .addAnswer(
            '¿De qué empresa te estás comunicando?🏭',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ empresa: ctx.body });
                await state.update({ telefono: ctx.from });
            }
        )
        .addAnswer(
            '👷¿Cuál es tu nombre?👷‍♀️',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ contacto: ctx.body });
            }
        )
        .addAnswer(
            '¿Cuál es tu correo?📭',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ correo: ctx.body });
            }
        )
        .addAnswer(
            '¿Qué problemas tienes?✍️',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ descripcion: ctx.body });
            }
        )
        .addAnswer(
            '¿Nos puedes contar como te está afectando el problema?📈',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ impacto: ctx.body });
            }
        )
        .addAnswer(
            '💻¿En qué software estás encontrando el problema el problema? (windows, mac, linux, android, ios, no aplica)',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ so: ctx.body });
            }
        )
        .addAnswer(
            '¿En qué tipo de dispositivo encontró el problema?📱 (Desktop, tablet, celular, no aplica)',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ dispositivo: ctx.body });
            }
        )
        .addAnswer(
            '¿Cuál prioridad describiría mejor el problema?🚦 (Baja, media, alta)',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ prioridad: ctx.body });
            }
        )
        .addAnswer(
            '¿Tiene alguna información adicional que nos ayude a tener un mejor panorama 🌄 del problema?🗣️',
            {
                capture: true,
            },
            async (ctx, { state }) => {
                await state.update({ adicional: ctx.body });
                const myState = state.getMyState();

                const report = {
                    empresa: myState.empresa,
                    telefono: myState.telefono,
                    contacto: myState.contacto,
                    correo: myState.correo,
                    descripcion: myState.descripcion,
                    impacto: myState.impacto,
                    so: myState.so,
                    dispositivo: myState.dispositivo,
                    prioridad: myState.prioridad,
                    adicional: myState.adicional
                };
                console.log(report);
                await state.update({ resp: 'Pronto nos comunicaremos contigo' });
                
                try {
                    const response = await axios.post('http://localhost:4321/api/reportwhatsapp', report);
                    const ticketId = response.data.id;
                    await state.update({ resp: `Listo🤖, tu número de ticket es ${ticketId}` });
                } catch (error) {
                    console.error('Error al enviar el reporte:', error);
                    await state.update({ resp: `Listo🤖, tu número de ticket es ${ticketId}` });
                }
            }
        )
        .addAnswer(
            'Hemos recibido tu reporte!',
            null,
            async (ctx, { flowDynamic, state }) => {
                const resp = state.get('resp');
                await flowDynamic(`${resp}`);
            }
        );

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowConsultas, menuFlow, flowReporte])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
