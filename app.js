const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const path = require("path")
const fs = require("fs")
const axios = require('axios')

const chat = require("./chatGPT")

const pathConsultas = path.join(__dirname, "mensajes", "promptConsultas.md")
const promptConsultas = fs.readFileSync(pathConsultas, "utf8")

const playersPickedPath = path.join(__dirname, "mensajes", "playersPicked.md");
const top12Path = path.join(__dirname, "mensajes", "top12.md");
const top12 = fs.readFileSync(top12Path, "utf8")

const buildMyTeamPath = path.join(__dirname, "mensajes", "buildMyTeam.md");

const myTeamPath = path.join(__dirname, "mensajes", "myTeam.md");



const playerPickedFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer("¿Qué jugador tomaron?", { capture: true }, async (ctx, ctxFn) => {
        const playerPicked = ctx.body;
        console.log(playerPicked);

        fs.appendFile(playersPickedPath, `- ${playerPicked}\n`, (err) => {
            if (err) {
                console.error('Error al escribir en el archivo:', err);
            } else {
                console.log(`Jugador "${playerPicked}" añadido a playersPicked.md`);
            }
        });
    });


const picAPlayerFlow = addKeyword(['pick a player', '3'])
    .addAnswer("Que ronda vas a elegir, ejemplo: *Segunda*, *Tercera*", { capture: true }, async (ctx, ctxFn) => {
        const round = ctx.body;

        const playersPicked = fs.readFileSync(playersPickedPath, "utf8")
        const firstInstruction = fs.readFileSync(buildMyTeamPath, "utf8")
        const consulta = `${firstInstruction}. Estamos en la ${round} ronda y los jugadores ya seleccionados son ${playersPicked}. Que jugador debo elegir? Solo recurre a la informacion de los documentos, debes de ser conciso y dame la lista de recomendados completa para esa ronda en ese armado. Limitate a responer lo que te estoy pidiendo, muchas gracias :)`
        const prompt = promptConsultas

        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)

    })
    .addAnswer("Que jugador elegiste?", { capture: true }, async (ctx, ctxFn) => {
        const playerPicked = ctx.body;
        console.log(playerPicked);

        fs.appendFile(buildMyTeamPath, `Quiero construir mi equipo alrededor de ${playerPicked}\n`, (err) => {
            if (err) {
                console.error('Error al escribir en el archivo:', err);
            } else {
                console.log(`"${playerPicked}" añadido a playersPicked`);
            }
        });
        fs.appendFile(myTeamPath, `- ${playerPicked}\n`, (err) => {
            if (err) {
                console.error('Error al escribir en el archivo:', err);
            } else {
                console.log(`"${playerPicked}" añadido a tu equipo`);
            }
        });
        await ctxFn.flowDynamic(`${playerPicked} añadido a tu equipo y a jugadores seleccionados`);
    });



const firstPickFlow = addKeyword(['Primer pick', '1'])
    .addAnswer("Es el primer pick?", { capture: true }, async (ctx, ctxFn) => {
        const x = ctx.body;

        const playersPicked = fs.readFileSync(playersPickedPath, "utf8")
        const prompt = promptConsultas

        const consulta = `Para mi primer pick, quiero elegir al jugador mas arriba disponible de estos ${top12} los jugadores ya seleccionados son ${playersPicked}. Solo recurre a la informacion de los documentos, debes de ser conciso y no dara mucho contenido. Limitate a responer lo que te estoy pidiendo, muchas gracias :)`
        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)

    })
    .addAnswer("Cual fue tu primer pick?", { capture: true }, async (ctx, ctxFn) => {
        const playerPicked = ctx.body;
        console.log(playerPicked);

        fs.appendFile(buildMyTeamPath, `Quiero construir mi equipo alrededor de ${playerPicked}\n`, (err) => {
            if (err) {
                console.error('Error al escribir en el archivo:', err);
            } else {
                console.log(`"${playerPicked}" añadido a playersPicked`);
            }
        });
        fs.appendFile(myTeamPath, `- ${playerPicked}\n`, (err) => {
            if (err) {
                console.error('Error al escribir en el archivo:', err);
            } else {
                console.log(`"${playerPicked}" añadido a tu equipo`);
            }
        });
        await ctxFn.flowDynamic(`${playerPicked} añadido a tu equipo y a jugadores seleccionados`);
    });


const myTeamFlow = addKeyword('Ver Mi Equipo').addAnswer(fs.readFileSync(myTeamPath, "utf8"))





const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([playerPickedFlow, picAPlayerFlow, firstPickFlow, myTeamFlow])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
