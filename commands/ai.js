const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Prodia } = require('prodia.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription("Artificial Intelligence")
        .setContexts(0, 1, 2)
        .setIntegrationTypes(1)
        .addSubcommand(com => com
            .setName('code')
            .setDescription("Complete code for you")
            .addStringOption(option => option
                .setName('code-prompt')
                .setDescription("What do you want me to code?")
                .setRequired(true)
            )
        )
        .addSubcommand(com => com
            .setName('answer')
            .setDescription("Answer a general question for you.")
            .addStringOption(option => option
                .setName('query')
                .setDescription("What do you to know?")
                .setRequired(true)
            )
        )
        .addSubcommand(com => com
            .setName('draw')
            .setDescription("Draw an image for you")
            .addStringOption(option => option
                .setName('image-prompt')
                .setDescription("What do you want me to draw?")
                .setRequired(true)
            )
        ),
    execute: async function (interaction, client) {
        const { options } = interaction;

        await interaction.deferReply();

        const embed = new EmbedBuilder()
        .setColor(client.config.colour)
        .setFooter({ text: `Requested by ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

        async function geminiReq(prompt) {
            const ai = new GoogleGenerativeAI(client.config.gemini_api);
            const generationConfig = {
                maxOutputTokens: 640,
            };

            const model = ai.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig
            });
            const result = await model.generateContent(prompt);
            embed.setDescription(`${result.response.text()}`)
            .setTitle(prompt)
        };

        const subcommand = options.getSubcommand();
        const codeprompt = options.getString("code-prompt");
        const query = options.getString('query');
        const imageprompt = options.getString("image-prompt");

        try {

            if (subcommand === 'code') {
                await geminiReq("Code me " + codeprompt);
                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand === 'query') {
                await geminiReq(query);
                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand === 'draw') {
                const { generateImage, wait } = Prodia(client.config.prodia_api);

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
        
                const response = await generate(imageprompt);
                embed.setTitle(imageprompt)
                .setURL(response.imageUrl)
                .setImage(response.imageUrl);

                const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(response.imageUrl)
                    .setLabel('Link to Image')
                )

                await interaction.editReply({ embeds: [embed], components: [button] });
            }
        } catch (error) {
            client.logs.debug(error);
            await interaction.editReply({ content: `Failed to fetch image\n${error}`})
        }
    }
}
