const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const branch = ctx.params.branch;
    const filepath = ctx.params.filepath;

    const fileUrl = `https://github.com/${user}/${repo}/commits/${branch}/${filepath}`;

    const reqParams = {
        sha: branch,
        path: filepath,
    };
    if (config.github.access_token) {
        reqParams.access_token = config.github.access_token;
    }

    const res = await axios.get(`https://api.github.com/repos/${user}/${repo}/commits`, {
        params: reqParams,
    });
    const list = res.data;
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItems = await Promise.all(
        count.map(async (i) => {
            const each = list[i];
            const item = {
                title: each.commit.message.split('\n')[0],
                description: `<pre>${each.commit.message}</pre>`,
                link: each.html_url,
                author: each.commit.author.name,
                pubDate: new Date(each.commit.committer.date).toUTCString(),
            };
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `GitHub File - ${user}/${repo}/${branch}/${filepath}`,
        link: fileUrl,
        item: resultItems,
    };
};