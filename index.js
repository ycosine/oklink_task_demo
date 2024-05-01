require("dotenv").config();

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// 示例地址，你可以替换成实际的地址
const addresses = "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326";
const addresses2 = "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf";
const addresses3 = "0xE92d1A43df510F82C66382592a047d288f85226f";
const prefix = "https://www.oklink.com";

const settings = {
  method: "GET",
  headers: {
    Accept: "*/*",
    "Ok-Access-Key": process.env.API_KEY, // 使用环境变量中的API键
  },
};
// 获取地址活跃链的函数

// 获取地址活跃链的函数
async function getAddressActiveChain(address) {
  try {
    // 在axios.get请求中使用settings
    const response = await axios.get(
      prefix +
        `/api/v5/explorer/address/address-active-chain?address=${address}`,
      settings // 在这里传递settings
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
// 获取地址本链币余额、代币持仓、NFT持仓的函数
async function getAddressSummary(address) {
  try {
    const response = await axios.get(
      prefix +
        `/api/v5/explorer/address/address-summary?address=${address}&chainShortName=eth`,
      settings // 在这里传递settings
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
async function getTokenBalance(address) {
  try {
    const response = await axios.get(
      prefix +
        `/api/v5/explorer/address/token-balance?chainShortName=eth&address=${address}&protocolType=token_20&limit=1`,
      settings // 在这里传递settings
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
async function getAddressBalance(address) {
  try {
    const response = await axios.get(
      prefix +
        `/api/v5/explorer/address/address-balance-fills?chainShortName=eth&address=${address}&limit=1`,
      settings
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
async function getTokenMarketData(tokenContractAddress) {
  try {
    const response = await axios.get(
      prefix +
        `/api/v5/explorer/tokenprice/market-data?chainId=1&tokenContractAddress=${tokenContractAddress}`,
      settings
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getTransactionList(address) {
  try {
    const response = await axios.get(
      prefix +
        `/api/v5/explorer/address/transaction-list?chainShortName=eth&address=${address}&limit=1`,
      settings
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getEntityLabel(address) {
  try {
    const response = await axios.get(
      prefix +
        `/api/v5/explorer/address/entity-label?chainShortName=eth&address=${address}`,
      settings
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// router api

app.get("/task1", async (req, res) => {
  try {
    const response = await getAddressActiveChain(addresses);
    console.info(response.data);
    const data = response.data;
    // 把API响应转换成HTML格式
    let htmlResponse = `<h1>Task1:地址活跃链:getAddressActiveChain</h1>`;
    data.forEach((chain) => {
      const str = `Chain Name: ${chain.chainFullName} (${chain.chainShortName})`;
      htmlResponse += `<p>${str}</p>`;
    });

    res.send(htmlResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred ");
  }
});

app.get("/task2", async (req, res) => {
  try {
    const response = await getAddressSummary(addresses);
    const response2 = await getTokenBalance(addresses);
    const summary = response.data[0];
    const tokenList = response2.data[0].tokenList;
    // 把API响应转换成HTML格式
    let htmlResponse = `<h1>Task2:地址本链币余额、代币持仓、NFT持仓:getAddressSummary,getTokenBalance</h1>`;
    htmlResponse += `<p>${JSON.stringify(summary, null, 4)}</p>`;
    htmlResponse += `<p>${JSON.stringify(tokenList, null, 2)}</p>`;
    // 添加更多的数据点...

    // 发送HTML响应
    res.send(htmlResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred ");
  }
});

app.get("/task3", async (req, res) => {
  try {
    const response = await getAddressBalance(addresses);
    console.info(response.data);
    const data = response.data[0].tokenList;
    const tokenContractAddress = data[0].tokenContractAddress;
    const response2 = await getTokenMarketData(tokenContractAddress);

    const totalValueCount = data.reduce((acc, token) => {
      return acc + Number.parseFloat(token.valueUsd);
    }, 0);
    // 把API响应转换成HTML格式
    let htmlResponse = `<h1>地址ERC20代币总美元价值、代币数据表现（市值、24h交易量）</h1>`;
    htmlResponse += `<p>${JSON.stringify(data, null, 2)}</p>`;
    htmlResponse += `<p>总美元价值（单位美元）：${totalValueCount}</p>`;
    htmlResponse += `<p>查询持有的token数据表现：${tokenContractAddress}</p>`;
    htmlResponse += `<p>${JSON.stringify(response2.data, null, 2)}</p>`;
    // 添加更多的数据点...
    // 发送HTML响应
    res.send(htmlResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred ");
  }
});

app.get("/task4", async (req, res) => {
  try {
    const response = await getTransactionList(addresses2);
    const data = response.data[0].transactionLists;
    const toAddr = data[0].to;
    const response2 = await getEntityLabel(toAddr);
    // 把API响应转换成HTML格式
    let htmlResponse = `<h1>地址近10000笔交易中，交互最多的地址，以及该地址是否为交易所大地址或项目方地址</h1>`;
    htmlResponse += `<p>${JSON.stringify(response.data, null, 2)}</p>`;
    htmlResponse += `<p>交互最多的地址${toAddr}</p>`;
    htmlResponse += `<p>该地址的标签：${JSON.stringify(
      response2.data,
      null,
      2
    )}</p>`;
    // 添加更多的数据点...

    // 发送HTML响应
    res.send(htmlResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred ");
  }
});

// 设置webhook路由，用于监控地址代币交易
app.get("/task5", async (req, res) => {
  const webhookData = {
    event: "tokenTransfer",
    chainShortName: "eth",
    webhookUrl: "your own url", // 替换为你的接收 Webhook 的 URL
    trackerName: "myTrackerName",
    addresses: [
      "0xceb69f6342ece283b2f5c9088ff249b5d0ae66ea",
      "0x21a31ee1afc51d94c2efccaa2092ad1028285549",
    ],
    tokenContractAddress: [
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    ],
    valueUsdFilter: {
      minValueUsd: "50000",
      maxValueUsd: "100000",
    },
    amountFilter: {
      minAmount: "23",
      maxAmount: "40",
    },
  };

  try {
    const response = await axios.post(
      `${prefix}/api/v5/explorer/webhook/create-address-activity-tracker`,
      webhookData,
      settings
    );
    let htmlResponse = `<h1>创建 webhook ...</h1>`;
    htmlResponse += `<p>${JSON.stringify(response.data, null, 2)}</p>`;
    res.send(htmlResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred ");
  }
});

app.get("/webhook", async (req, res) => {
  try {
    const response2 = await axios.get(
      `${prefix}/api/v5/explorer/webhook/get-tracker-list`,
      settings
    );
    const data = response2.data.data[0]?.trackerList;
    let htmlResponse2 = `<h1>现有的 webhook ...</h1>`;
    htmlResponse2 += `<p>${JSON.stringify(data, null, 2)}</p>`;
    res.send(htmlResponse2);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred ");
  }
});

// 主页路由
app.get("/", (req, res) => {
  // 使用 HTML 字符串构建页面内容
  const htmlContent = `
        <html>
            <head>
                <title>Home Page</title>
            </head>
            <body>
                <h1>Welcome to the OkLink Demo Page</h1>
                <ul>
                    <li><a href="/task1">Task 1</a></li>
                    <li><a href="/task2">Task 2</a></li>
                    <li><a href="/task3">Task 3</a></li>
                    <li><a href="/task4">Task 4</a></li>
                    <li><a href="/task5">Task 5</a></li>
                    <li><a href="/webhook">Webhook</a></li>
                </ul>
            </body>
        </html>
    `;

  // 发送 HTML 响应
  res.send(htmlContent);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
