import https from 'node:https';
import fs from 'node:fs';
const url = "https://mmbiz.qpic.cn/mmbiz_gif/nZHRG2ibhP1lnzGvdTu2ZsxdYHpJ1aibkFDSAc4d0gp5a3sN8sEDkHVHzicoS1b5qJxkOV9PEzTDS49sAOex3x64g/640?wx_fmt=gif";
https.get(url, { rejectUnauthorized: false, headers: { "Referer": "https://mp.weixin.qq.com/" } }, (res) => {
    const stream = fs.createWriteStream("public/assets/images/HyperOS_8月更新一览_(2024)/0.webp");
    res.pipe(stream);
});
