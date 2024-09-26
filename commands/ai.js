const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Prodia } = require('prodia.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ai")
        .setDescription('Draw images, request code, debug code and more')
        .setContexts(0, 1, 2)
        .setIntegrationTypes(1)
        .addSubcommand((com) => com
            .setName('general')
            .setDescription('Text-based AI')
            .addStringOption((opt) => opt
                .setName('query')
                .setDescription('What would you like to know?')
                .setRequired(true)
            )
        )
        .addSubcommand((com) => com
            .setName('code')
            .setDescription('Request code from gemini.')
            .addStringOption((opt) => opt
                .setName('code-prompt')
                .setDescription('What do you want me to code')
                .setRequired(true)
            )
        )
        .addSubcommand((com) => com
            .setName('imagine')
            .setDescription('Imagine images with AI')
            .addStringOption((opt) => opt
                .setName('image-prompt')
                .setDescription('What do you want me to draw')
                .setRequired(true)
            )
        )
        .setContexts(0, 1, 2)
        .setIntegrationTypes(1),
    execute: async function (interaction, client) {

        async function gemini(prompt) {
            const ai = new GoogleGenerativeAI(client.config.gemini_api);
            const generationConfig = {
                maxOutputTokens: 640,
            };
            const model = ai.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig
            });

            const result = await model.generateContent(prompt);
            embed.setDescription(`${result.response.text()}`);
        }

        await interaction.deferReply();

        const { options } = interaction;

        const query = options.getString('query'); // generalAI;
        const codePrompt = options.getString('code-prompt'); // requesting code;
        const imaginePrompt = options.getString('imagine-prompt'); // generating images;

        const subCommand = options.getSubcommand();

        const embed = new EmbedBuilder()
            .setColor(client.config.colour)
        //.setAuthor({ iconURL: client.user.displayAvatarURL() });

        switch (subCommand) {
            case "general":
                if (query.startsWith('code')) return interaction.editReply({ content: `Please use \`/assistant code\` to generate code related responses`, ephemeral: true });

                await gemini(query);
                await interaction.editReply({ embeds: [embed] });
                break;
            case "code":
                const newPrompt = `Code me ` + codePrompt;
                await gemini(newPrompt);
                await interaction.editReply({ embeds: [embed] });
                break;
            case "imagine":
                const { generateImage, wait } = Prodia(client.config.prodia_api);

                const imaginePrompt = interaction.options.getString('image-prompt');

                const generate = async (prompt) => {
                    const result = await generateImage({
                        prompt: prompt,
                        model: "juggernaut_aftermath.safetensors [5e20c455]",
                        negative_prompt: "",
                        sampler: "DPM++ 2M Karras",
                        cfg_scale: 9,
                        steps: 20,
                        seed: -1,
                        upscale: true,
                        //image_style: "cinematic"
                    })

                    return await wait(result);
                }

                const response = await generate(imaginePrompt);
                await interaction.editReply({ content: `${query}`, files: [response.imageUrl] })
        }
    }
}
