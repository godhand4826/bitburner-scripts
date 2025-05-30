import { NS } from '@ns';
import { getBudget } from './money';


export function purchaseStockAPIs(ns: NS) {
    purchaseWseAccount(ns)
    purchase4SMarketData(ns)
    purchaseTixApi(ns)
    purchase4SMarketDataTixApi(ns)
}

export function purchaseWseAccount(ns: NS) {
    if (!ns.stock.hasWSEAccount() && ns.stock.purchaseWseAccount()) {
        ns.tprint('You have purchased WSE account');
    }
}

export function purchase4SMarketData(ns: NS) {
    if (!ns.stock.has4SData() && ns.stock.purchase4SMarketData()) {
        ns.tprint('You have purchased 4SData access');
    }
}

export function purchaseTixApi(ns: NS) {
    if (!ns.stock.hasTIXAPIAccess() && ns.stock.purchaseTixApi()) {
        ns.tprint('You have purchased TIX API access');
    }
}

export function purchase4SMarketDataTixApi(ns: NS) {
    if (
        !ns.stock.has4SDataTIXAPI() &&
        ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess() &&
        ns.stock.purchase4SMarketDataTixApi()
    ) {
        ns.tprint('You have purchased 4SData TIX API access');
    }
}

export function isFullyPurchasedStockAPIs(ns: NS): boolean {
    return (
        ns.stock.hasWSEAccount() &&
        ns.stock.has4SData() &&
        ns.stock.hasTIXAPIAccess() &&
        ns.stock.has4SDataTIXAPI()
    )
}

export function sellAll(ns: NS, sym: string) {
    const [sharesLong, avgLongPrice] = ns.stock.getPosition(sym)

    const sellPrice = ns.stock.sellStock(sym, sharesLong)
    const profit = sharesLong * (sellPrice - avgLongPrice)

    if (sharesLong > 0) {
        ns.toast(`Sell max ${sym} for ${ns.formatNumber(profit)}`, 'info')
    }
}

export function buyMax(ns: NS, sym: string, preservedMoney = 0) {
    const budget = getBudget(ns, Infinity, preservedMoney)

    const commission = 100_000
    const askPrice = ns.stock.getAskPrice(sym)
    const demandShares = Math.floor((budget - commission) / askPrice)

    const maxShares = ns.stock.getMaxShares(sym)
    const positionShares = ns.stock.getPosition(sym)[0]
    const supplyShares = maxShares - positionShares

    const buyShares = Math.min(supplyShares, demandShares)
    const buyPrice = ns.stock.buyStock(sym, buyShares)
    const cost = buyPrice * buyShares
    if (cost > 0) {
        ns.toast(`Buy max ${sym} with ${ns.formatNumber(cost)}`, 'info');
    }
}

export function momentum(ns: NS, sym: string): number {
    const forecast = ns.stock.getForecast(sym)
    const increaseRate = forecast
    const decreaseRate = 1 - forecast
    const volatility = ns.stock.getVolatility(sym)
    return increaseRate * volatility - decreaseRate * volatility
}

export function getTotalPosition(ns: NS): number {
    const symbols = ns.stock.getSymbols()
    let money = 0
    for (const sym of symbols) {
        money += ns.stock.getSaleGain(sym, ns.stock.getPosition(sym)[0], 'Long')
    }
    return money
}

export function getAsset(ns: NS): number {
    const cash = getBudget(ns)
    const stock = ns.stock.hasTIXAPIAccess() ? getTotalPosition(ns) : 0
    const asset = cash + stock

    return asset
}

export function closeAllPosition(ns: NS) {
    ns.stock.getSymbols().forEach(sym => sellAll(ns, sym))
}

export function autoClosePositions(ns: NS) {
    ns.stock.getSymbols()
        .filter(sym => momentum(ns, sym) <= 0)
        .forEach(sym => sellAll(ns, sym))
}

export function autoCreatePositions(ns: NS, preservedMoney = 0) {
    ns.stock.getSymbols()
        .filter(sym => momentum(ns, sym) > 0)
        .sort((a, b) => -(momentum(ns, a) - momentum(ns, b)))
        .forEach(sym => buyMax(ns, sym, preservedMoney))
}