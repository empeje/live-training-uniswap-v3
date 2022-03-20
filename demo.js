// create a pool instance

const { ethers } = require("ethers");
const { Pool, TickListDataProvider, Tick} = require("@uniswap/v3-sdk");
const { Token } = require("@uniswap/sdk-core");
const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json")

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/752fd90faa1a42eaa668ce9ae05b8ff5");

const poolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";
const poolContract = new ethers.Contract(poolAddress, UniswapV3Pool.abi, provider);

async function main() {

    const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const token0 = new Token(1, usdcAddress, 6, "USDC", "USD Coin");
    const token1 = new Token(1, wethAddress, 18, "WETH", "Wrapped Ether");

    const poolFee = await poolContract.fee();
    const slot0 = await poolContract.slot0();

    // Todo for myself, if it's coming from contract why not minimizing the number of parameters
    const poolLiquidity = await poolContract.liquidity();
    const tickSpacing = await poolContract.tickSpacing();
    const nearestTick = Math.floor(slot0[1] / tickSpacing) * tickSpacing;
    const tickLowerIndex = nearestTick - (60 * 1000);
    const tickUpperIndex = nearestTick + (60 * 1000);

    const tickLowerData = await poolContract.ticks(tickLowerIndex);
    const tickUpperData = await poolContract.ticks(tickUpperIndex);

    const tickLower = new Tick({
        index: tickLowerIndex,
        liquidityGross: tickLowerData.liquidityGross,
        liquidityNet: tickLowerData.liquidityNet
    });
    const tickUpper = new Tick({
        index: tickUpperIndex,
        liquidityGross: tickUpperData.liquidityGross,
        liquidityNet: tickUpperData.liquidityNet
    });
    console.log({
        nearestTick,
        tickLowerIndex,
        tickUpperIndex,
        slot01: slot0[1],
        tickLower,
        tickUpper,
        tickSpacing
    })

    const tickList = new TickListDataProvider([tickLower, tickUpper], tickSpacing);

    const pool = new Pool(
        token0,
        token1,
        poolFee,
        slot0[0],
        poolLiquidity,
        slot0[1],
        tickList
    );

    console.log(pool);
}

main().catch(e => console.log(e));