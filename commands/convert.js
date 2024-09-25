const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convert')
        .setDescription('Convert currencies')
        .addIntegerOption((opt) =>
            opt.setName('amount')
                .setDescription('The amount you want to convert.')
                .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('from')
                .setDescription('The currency you\'re converting from')
                .addChoices(
                    { name: "GBP", value: "GBP" },
                    { name: "USD", value: "USD" },
                    { name: "EUR", value: "EUR" },
                    { name: "JPY", value: "JPY" },
                    { name: "CAD", value: "CAD" },
                    { name: "AUD", value: "AUD" },
                )
                .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('to')
                .setDescription('The currency you\'re converting to')
                .addChoices(
                    { name: "GBP", value: "GBP" },
                    { name: "USD", value: "USD" },
                    { name: "EUR", value: "EUR" },
                    { name: "JPY", value: "JPY" },
                    { name: "CAD", value: "CAD" },
                    { name: "AUD", value: "AUD" },
                )
                .setRequired(true)
        ),

    execute: async function (interaction, client) {
        const from = interaction.options.getString('from');
        const to = interaction.options.getString('to');
        const amount = interaction.options.getInteger('amount');

        const options = {
            method: 'GET',
            url: 'https://currency-converter-pro1.p.rapidapi.com/convert',
            params: {
              from: from,
              to: to,
              amount: amount
            },
            headers: {
              'x-rapidapi-key': '50679cb87bmsh80064722b061922p179870jsnc77a797b94b6',
              'x-rapidapi-host': 'currency-converter-pro1.p.rapidapi.com'
            }
          };

        try {
            const response = await axios.request(options);
            //console.log(response.data);

            const embed = new EmbedBuilder()
            .setAuthor({ name: `${from} to ${to}`, iconURL: client.user.displayAvatarURL() })
            .setColor(client.config.GLOBAL_COLOUR)
            .setDescription(`**${amount}**${from} is **${response.data.result.toFixed(2)}**${to}`)

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    }
}