const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const request = require('request');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tiktok-user')
        .setDescription('Get a tiktok users information')
        .addStringOption(option => option.setName('username').setDescription('The username').setRequired(true))
        .setContexts(0, 1, 2)
        .setIntegrationTypes(1),

    execute: async function (interaction, client) {

        await interaction.deferReply();

        const username = interaction.options.getString('username');

        const options = {
            method: 'GET',
            url: 'https://tiktok-api6.p.rapidapi.com/user/details',
            params: {
                username: username
            },
            headers: {
                'x-rapidapi-key': '74157f9c40msh14976045e5e6fddp1b9973jsnfdf04a5c6712',
                'x-rapidapi-host': 'tiktok-api6.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);
            console.log(response.data);

            let username = response.data.nickname;
            if (response.data.verified === true) {
                username = `${response.data.nickname} <:Verified:1283858273262637078>`
            }

            const embed = new EmbedBuilder()
            .setTitle(username)
            .addFields(
                { name: "Username", value: `${response.data.username}` },
                { name: "Bio", value: `${response.data.description}` },
                { name: "Followers", value: `${response.data.followers}` },
                { name: "Following", value: `${response.data.following}` },
                { name: "Total Videos", value: `${response.data.total_videos}` },
                { name: "Total Likes", value: `${response.data.total_heart}` },
                
            )
            .setThumbnail(`${response.data.profile_image}`)
            .setColor(client.config.colour)

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    }
}