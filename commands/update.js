// will not work on user installs.

const {
    SlashCommandBuilder,
    ActivityType,
    EmbedBuilder,
  } = require("discord.js");
  const client = require("../../index");
  
  module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
      .setName("update")
      .setDescription("Update the bots presence/ activity")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("activity")
          .setDescription("Update the bots activity")
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Pick an activity")
              .addChoices(
                { name: "Playing", value: "Playing" },
                { name: "Streaming", value: "Streaming" },
                { name: "Listening", value: "Listening" },
                { name: "Watching", value: "Watching" },
                { name: "Competing", value: "Competing" }
              )
          )
          .addStringOption((option) =>
            option.setName("activity").setDescription("Set your current activity")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("status")
          .setDescription("Update the bots status")
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Pick a status")
              .addChoices(
                { name: "Online", value: "online" },
                { name: "Idle", value: "idle" },
                { name: "Do not disturb", value: "dnd" },
                { name: "Invisible", value: "invisible" }
              )
          )
      ),
    async execute(interaction, client) {
      const { options, user } = interaction;
  
      const sub = options.getSubcommand(["activity", "status"]);
      const type = options.getString("type");
      const activity = options.getString("activity");
  
      try {
        switch (sub) {
          case "activity":
            switch (type) {
              case "Playing":
                client.user.setActivity(activity, { type: ActivityType.Playing });
                break;
              case "Streaming":
                client.user.setActivity(activity, {
                  type: ActivityType.Streaming,
                });
                break;
              case "Listening":
                client.user.setActivity(activity, {
                  type: ActivityType.Listening,
                });
                break;
              case "Watching":
                client.user.setActivity(activity, {
                  type: ActivityType.Watching,
                });
                break;
              case "Competing":
                client.user.setActivity(activity, {
                  type: ActivityType.Competing,
                });
                break;
            }
          case "status":
            client.user.setPresence({ status: type });
            break;
        }
      } catch (err) {
        console.log(err);
      }
  
      const embed = new EmbedBuilder()
        .setDescription(
          `Succesfully updated your ${sub} to **${type}** with status **${activity}**`
        )
        .setTimestamp();
  
      if (activity === null) {
        embed.setDescription(`Successfully updated your sub to **{type}**`);
      }
  
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    },
  };
  
