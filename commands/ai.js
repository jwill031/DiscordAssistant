const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RsnChat } = require('rsnchat');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ai")
        .setDescription("Assistants AI")
        .addStringOption(option => option
            .setName('type')
            .setDescription('What do you want the AI to do?')
            .setRequired(true)
            .addChoices(
                { name: "Answer", value: "answer" },
                { name: "Code", value: "code" },
                { name: "Image Generation", value: "imagine" }
            )
        )
        .addStringOption(option => option
            .setName('query')
            .setDescription("Query to give to the AI")
            .setRequired(true)
        )
        .setContexts(0, 1, 2)
        .setIntegrationTypes(1),
    execute: async function (interaction, client) {
        const { options } = interaction;

        const type = options.getString('type');
        const query = options.getString('query');

        await interaction.deferReply();

        const rsnchat = new RsnChat(client.config.RSNCHAT_API);

        const embed = new EmbedBuilder()
            .setColor(client.config.colour)

        switch (type) {
            case "answer":
                rsnchat.gemini(query).then(async (response) => {
                    //console.log(response);
                    embed.setDescription(`${response.message}`);
                    await interaction.editReply({ embeds: [embed] });
                })
                break;
            case "code":
                rsnchat.gemini("Code me " + query).then(async (response) => {
                    //console.log(response);
                    embed.setDescription(`${response.message}`);
                    await interaction.editReply({ embeds: [embed] });
                })
                break;
            case "imagine":
                const negative_prompt = "bad quality, blurry";

                const model = "absolutereality_v181.safetensors [3d9d4d2b]";

                rsnchat.prodia(query, negative_prompt, model).then(async (response) => {
                    await interaction.editReply({ files: [response.imageUrl], content: `${query}` });
                });
                break;
        }
    }
}