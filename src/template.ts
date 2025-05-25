import { NS } from '@ns';
import { receive, send } from './lib/channel';
import { loadModules } from './lib/cdn';

export async function main(ns: NS): Promise<void> {
  const dateFns = loadModules().dateFns
  ns.tprint(dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSSS'))
  return
  const port = 42
  ns.atExit(() => ns.clearPort(port))

  setTimeout(async () => {
    for (let i = 0; i < 200; i++) {
      await send(ns, port, `${i}`)
    }
  }, 0);

  setTimeout(async () => {
    for (let i = 0; i < 100; i++) {
      ns.tprint('A', await receive(ns, port))
      await ns.asleep(20)
    }
    ns.tprint('A die')
  }, 1000);
  setTimeout(async () => {
    for (let i = 0; i < 100; i++) {
      ns.tprint('B', await receive(ns, port))
      await ns.asleep(20)
    }
    ns.tprint('B die')
  }, 20);

  await ns.asleep(10 * 1000)

  // ns.tprint(getSafeCheats(ns))
  // for (let i = 0; i <= 14; i++) {
  //   // 第一發 cheat 失敗有 10% 機率 直接輸game
  //   // 成功率 隨使用次數增加 會降低
  //   // 成功率 隨crime success rate 增加 會增加
  //   ns.tprintf(`No.${i + 1} of cheat: %s`, `${ns.formatPercent(ns.go.cheat.getCheatSuccessChance(i))}`)
  // }

  // ns.go.cheat.playTwoMoves(0, 0, 0, 0) // 連下兩子
  // ns.go.cheat.removeRouter(0, 0) // 拿掉棋子
  // ns.go.cheat.destroyNode(0, 0) // 刪除可擺放位置
  // ns.go.cheat.repairOfflineNode(0, 0) // 新增可擺放位置
  // const start = Date.now()
  // findAllValidMathExpressions(['7578381492', -71])
  // findAllValidMathExpressions(['913351778', -72])
  // findAllValidMathExpressions(['893700101727',100]) // 50s
  // findAllValidMathExpressions(['474148792091',-100]) // 50s
  // findAllValidMathExpressions(['5188213441',-21]) // 3s
  // findAllValidMathExpressions(['364036962035',23]) // 4m 3.9s
  // findAllValidMathExpressions(["866216325436",-74]) // 58s


  // const elapsed = Date.now() - start
  // ns.tprintf('elapsed %s', ns.tFormat(elapsed, true));

  // throw JSON.stringify(await fetch('https://petstore.swagger.io/v2/user', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     id: 0,
  //     username: 'string',
  //     firstName: 'string',
  //     lastName: 'string',
  //     email: 'string',
  //     password: 'string',
  //     phone: 'string',
  //     userStatus: 0
  //   }),
  //   headers: {
  //     accept: 'application/json',
  //     'Content-Type': 'application/json'
  //   }
  // }).then(res => res.json()))
  ns.tprint('Hello Remote API!');
}
