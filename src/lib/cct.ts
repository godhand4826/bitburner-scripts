import { NS } from '@ns';
import { now } from './time';

export function solve(ns: NS, host: string, cct: string): boolean {
  const contractType = ns.codingcontract.getContractType(cct, host);
  const contractData = ns.codingcontract.getData(cct, host);

  if (!isSolvable(ns, contractType)) {
    ns.toast(`No solver for '${contractType}' ${host} ${cct}`, 'warning');
    return false;
  }

  // Save contract description before attempting, as it may destruct (delete itself) after being attempted
  const cctDescription = formatContract(ns, host, cct)

  ns.toast(`Solving '${contractType}' ${host} ${cct}`);
  const start = now()
  const fn = getSolverFn(ns, contractType);
  const answer = fn(contractData);
  const reward = ns.codingcontract.attempt(answer, cct, host);
  const elapsed = now() - start

  const isSuccess = typeof reward === 'string' && reward.length > 0;
  const isSlow = elapsed >= 100;

  if (!isSuccess || isSlow) {
    ns.tprint(cctDescription);

    if (isSlow) {
      ns.tprint(`Solver ran slowly: ${ns.tFormat(elapsed, true)}`);
    }
  }

  if (isSuccess) {
    ns.toast(`Contract solved successfully! ${reward}`);
  } else {
    ns.tprint(`Failed to solve contract. Your answer: ${answer}`);
  }
  return isSuccess
}

export async function integrationTest(ns: NS) {
  let total = 0;
  let pass = 0;
  for (const contractType of ns.codingcontract.getContractTypes()) {
    if (!isSolvable(ns, contractType)) {
      ns.tprint(`Skip '${contractType}' since no solver found`);
      continue
    }

    const cct = createDummyContract(ns, contractType)
    const solved = solve(ns, 'home', cct);

    pass += solved ? 1 : 0;
    total += 1;

    await ns.sleep(200);
  }

  ns.tprint(`cct integration test complete (${pass}/${total})`)
}

export function createDummyContract(ns: NS, t: string): string {
  const cct = ns.codingcontract.createDummyContract(t)
  ns.tprint(`dummy contract '${t}' home ${cct} created`)
  return cct
}

export function show(ns: NS, host: string, cct: string) {
  ns.tprint(formatContract(ns, host, cct));
}

export function formatContract(ns: NS, host: string, cct: string) {
  return `'${ns.codingcontract.getContractType(cct, host)}' ${host} ${cct}:\n` +
    `${ns.codingcontract.getDescription(cct, host)}\n` +
    `Data: ${ns.codingcontract.getData(cct, host)}`;
}

export function isSolvable(ns: NS, contractType: string): boolean {
  return !!getSolverFn(ns, contractType);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSolverFn(ns: NS, contractType: string): any {
  switch (contractType) {
    case ns.enums.CodingContractName.FindLargestPrimeFactor:
      return findLargestPrimeFactor;
    case ns.enums.CodingContractName.SubarrayWithMaximumSum:
      return subarrayWithMaximumSum;
    case ns.enums.CodingContractName.TotalWaysToSum:
      return totalWaysToSum;
    case ns.enums.CodingContractName.TotalWaysToSumII:
      return totalWaysToSumII;
    case ns.enums.CodingContractName.SpiralizeMatrix:
      return spiralizeMatrix;
    case ns.enums.CodingContractName.ArrayJumpingGame:
      return arrayJumpingGame;
    case ns.enums.CodingContractName.ArrayJumpingGameII:
      return arrayJumpingGameII;
    case ns.enums.CodingContractName.MergeOverlappingIntervals:
      return mergeOverlappingIntervals;
    case ns.enums.CodingContractName.GenerateIPAddresses:
      return generateIPAddresses;
    case ns.enums.CodingContractName.AlgorithmicStockTraderI:
      return algorithmicStockTraderI;
    case ns.enums.CodingContractName.AlgorithmicStockTraderII:
      return algorithmicStockTraderII;
    case ns.enums.CodingContractName.AlgorithmicStockTraderIII:
      return algorithmicStockTraderIII;
    case ns.enums.CodingContractName.AlgorithmicStockTraderIV:
      return algorithmicStockTraderIV;
    case ns.enums.CodingContractName.MinimumPathSumInATriangle:
      return minimumPathSumInATriangle;
    case ns.enums.CodingContractName.UniquePathsInAGridI:
      return uniquePathsInAGridI;
    case ns.enums.CodingContractName.UniquePathsInAGridII:
      return uniquePathsInAGridII;
    case ns.enums.CodingContractName.ShortestPathInAGrid:
      return shortestPathInAGrid;
    case ns.enums.CodingContractName.SanitizeParenthesesInExpression:
      return sanitizeParenthesesInExpression;
    case ns.enums.CodingContractName.FindAllValidMathExpressions:
      return findAllValidMathExpressions;
    case ns.enums.CodingContractName.HammingCodesIntegerToEncodedBinary:
      return hammingCodesIntegerToEncodedBinary;
    case ns.enums.CodingContractName.HammingCodesEncodedBinaryToInteger:
      return null; // hammingCodesEncodedBinaryToInteger;
    case ns.enums.CodingContractName.Proper2ColoringOfAGraph:
      return proper2ColoringOfAGraph;
    case ns.enums.CodingContractName.CompressionIRLECompression:
      return compressionIRLECompression;
    case ns.enums.CodingContractName.CompressionIILZDecompression:
      return compressionIILZDecompression;
    case ns.enums.CodingContractName.CompressionIIILZCompression:
      return null; // compressionIIILZCompression;
    case ns.enums.CodingContractName.EncryptionICaesarCipher:
      return encryptionICaesarCipher;
    case ns.enums.CodingContractName.EncryptionIIVigenereCipher:
      return encryptionIIVigenereCipher;
    case ns.enums.CodingContractName.SquareRoot:
      return squareRoot;
    default:
      throw new Error(`Unknown contract type: ${contractType}`);
  }
}

export function findLargestPrimeFactor(n: number) {
  let max = 1
  for (let i = 2; i <= Math.sqrt(n); i++) {
    while (n % i == 0) {
      max = i
      n /= i
    }
  }

  if (n > 1) {
    max = n
  }
  return max
}

export function subarrayWithMaximumSum(array: number[]) {
  let max = array[0];
  let acc = array[0];
  for (let i = 1; i < array.length; i++) {
    acc = Math.max(array[i], acc + array[i]);
    max = Math.max(max, acc);
  }
  return max;
}

export function totalWaysToSum(target: number) {
  const cache = new Map<string, number>()
  return dfs(target - 1, target)

  function dfs(maxValue: number, target: number) {
    if (target < 0) {
      return 0
    } else if (target == 0) {
      return 1
    }

    const key = `${maxValue},${target}`
    if (!cache.has(key)) {
      let count = 0
      for (let i = 1; i <= maxValue; i++) {
        count += dfs(i, target - i)
      }
      cache.set(key, count)
    }

    return cache.get(key) as number
  }
}

export function totalWaysToSumII([target, array]: [number, number[]]) {
  const cache = new Map<string, number>()
  return ways(0, target);

  function ways(index: number, target: number) {
    if (index == array.length) {
      return target == 0 ? 1 : 0;
    }

    const key = `${index},${target}`
    if (!cache.has(key)) {
      let count = 0;
      for (let i = 0; i * array[index] <= target; i++) {
        count += ways(index + 1, target - i * array[index]);
      }
      cache.set(key, count)
    }

    return cache.get(key) as number;
  }
}

export function spiralizeMatrix(matrix: number[][]) {
  const POS = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  const Y = matrix.length
  const X = matrix[0].length
  const result: number[] = []
  let index = 0
  let y = 0
  let x = -1
  const len = [X, Y - 1]
  while (result.length < Y * X) {
    for (let i = 0; i < len[index % 2]; i++) {
      y += POS[index][0]
      x += POS[index][1]
      result.push(matrix[y][x])
    }
    len[index % 2] -= 1
    index = (index + 1) % 4
  }
  return result
}

export function arrayJumpingGame(array: number[]) {
  let max = 0
  for (let i = 0; i < array.length; i++) {
    if (i > max) {
      return Number(false)
    }
    max = Math.max(max, i + array[i])
  }
  return Number(true)
}

export function arrayJumpingGameII(array: number[]) {
  const dp: number[] = Array(array.length).fill(Infinity);
  dp[array.length - 1] = 0;
  for (let i = array.length - 2; i >= 0; i--) {
    for (let jump = 1; jump <= array[i] && i + jump < array.length; jump++) {
      dp[i] = Math.min(dp[i], 1 + dp[i + jump]);
    }
  }
  return dp[0] == Infinity ? 0 : dp[0];
}

export function mergeOverlappingIntervals(intervals: number[][]) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result: number[][] = [];
  for (const interval of intervals) {
    if (result.length == 0 || result[result.length - 1][1] < interval[0]) {
      result.push(interval);
    } else {
      result[result.length - 1][1] = Math.max(result[result.length - 1][1], interval[1]);
    }
  }
  return result;
}

export function generateIPAddresses(s: string) {
  const result: string[] = []
  dfs(0, 0, '')
  return result

  function dfs(i: number, count: number, current: string) {
    if (count == 4) {
      if (i == s.length) {
        result.push(current)
      }
      return
    }
    for (let j = 1; j <= 3; j++) {
      const sub = s.substring(i, i + j)
      if (sub.length > 1 && sub.startsWith('0')) {
        continue
      }
      const num = parseInt(sub)
      if (num >= 0 && num <= 255) {
        dfs(i + j, count + 1, current + (count == 3 ? sub : sub + '.'))
      }
    }
  }
}

export function algorithmicStockTraderI(prices: number[]) {
  let maxProfit = 0;
  let minPrice = Infinity;
  for (const p of prices) {
    maxProfit = Math.max(maxProfit, p - minPrice);
    minPrice = Math.min(minPrice, p);
  }
  return maxProfit;
}

export function algorithmicStockTraderII(prices: number[]) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    profit += Math.max(0, prices[i] - prices[i - 1]);
  }
  return profit;
}

export function algorithmicStockTraderIII(prices: number[]) {
  return algorithmicStockTraderIV([2, prices])
}

export function algorithmicStockTraderIV([tx, prices]: [number, number[]]) {
  const cache = new Map()
  return profit(0, false, tx);

  function profit(index: number, isHolding: boolean, tx: number): number {
    if (index >= prices.length) return 0;

    const key = `${index},${isHolding},${tx}`;
    if (!cache.has(key)) {
      const max = Math.max(
        profit(index + 1, isHolding, tx),
        isHolding ? prices[index] + profit(index + 1, false, tx) : -Infinity,
        !isHolding && tx > 0
          ? -prices[index] + profit(index + 1, true, tx - 1)
          : -Infinity,
      );
      cache.set(key, max);
    }

    return cache.get(key)
  }
}

export function minimumPathSumInATriangle(triangle: number[][]) {
  for (let y = 1; y < triangle.length; y++) {
    for (let x = 0; x < y + 1; x++) {
      triangle[y][x] += Math.min(
        x - 1 >= 0 ? triangle[y - 1][x - 1] : Infinity,
        x < triangle[y - 1].length ? triangle[y - 1][x] : Infinity,
      )
    }
  }
  return Math.min(...triangle[triangle.length - 1])
}

export function uniquePathsInAGridI([Y, X]: number[]) {
  const dp = Array(Y).fill(null).map(() => Array(X).fill(0))
  dp[0][0] = 1
  for (let y = 0; y < Y; y++) {
    for (let x = 0; x < X; x++) {
      dp[y][x] += (x > 0 ? dp[y][x - 1] : 0) + (y > 0 ? dp[y - 1][x] : 0)
    }
  }
  return dp[Y - 1][X - 1]
}

export function uniquePathsInAGridII(grid: number[][]) {
  const Y = grid.length
  const X = grid[0].length
  const dp = Array(Y).fill(null).map(() => Array(X).fill(0))
  dp[0][0] = 1
  for (let y = 0; y < Y; y++) {
    for (let x = 0; x < X; x++) {
      if (grid[y][x] == 0) {
        dp[y][x] += (x > 0 ? dp[y][x - 1] : 0) + (y > 0 ? dp[y - 1][x] : 0)
      }
    }
  }
  return dp[Y - 1][X - 1]
}

export function shortestPathInAGrid(grid: number[][]) {
  const POS: [string, number[]][] = [
    ['U', [-1, 0]],
    ['D', [+1, 0]],
    ['R', [0, +1]],
    ['L', [0, -1]],
  ];
  const Y = grid.length;
  const X = grid[0].length;
  const seen: Set<string> = new Set();
  const asKey = (y: number, x: number) => `${y},${x}`;
  const tasks: [string, number[]][] = [['', [0, 0]]];
  while (tasks.length > 0) {
    const [moves, [y, x]] = tasks.shift() ?? [0, []];
    if (y == Y - 1 && x == X - 1) {
      return moves;
    }
    for (const [m, [dy, dx]] of POS) {
      const ny = y + dy;
      const nx = x + dx;
      const key = asKey(ny, nx);
      if (
        0 <= ny &&
        ny < Y &&
        0 <= nx &&
        nx < X &&
        grid[ny][nx] == 0 &&
        !seen.has(key)
      ) {
        seen.add(key);
        tasks.push([moves + m, [ny, nx]]);
      }
    }
  }
  return '';
}

export function sanitizeParenthesesInExpression(s: string) {
  const result = new Set<string>()
  dfs(0, 0, '')
  const arr = Array.from(result)
  const max = Math.max(...arr.map(s => s.length))
  return arr.filter(s => s.length == max)

  function dfs(i: number, open: number, current: string) {
    if (i == s.length) {
      if (open == 0) {
        result.add(current)
      }
      return
    }
    if (s[i] == '(') {
      dfs(i + 1, open + 1, current + '(')
      dfs(i + 1, open, current)
    } else if (s[i] == ')') {
      if (open > 0) {
        dfs(i + 1, open - 1, current + ')')
      }
      dfs(i + 1, open, current)
    } else {
      dfs(i + 1, open, current + s[i])
    }
  }
}

export function findAllValidMathExpressions([s, n]: [string, number]) {
  const result: string[] = [];
  dfs('', 0, 0, 0)
  return result

  function dfs(expr: string, i: number, value: number, lastOperand: number) {
    if (i == s.length) {
      if (value == n) {
        result.push(expr);
      }
      return
    }

    // try all possible digits from s[i:i+1] to s[i:s.length]
    for (let j = i; j < s.length; j++) {
      if (s[i] == '0' && j != i) {
        // skip leading zero
        break;
      }

      const digits = s.substring(i, j + 1);
      const v = parseInt(digits);
      if (i == 0) {
        // can't add any operator before the first digits of the whole expression
        dfs(`${v}`, j + 1, v, v);
      } else {
        dfs(`${expr}+${digits}`, j + 1, value + v, v);
        dfs(`${expr}-${digits}`, j + 1, value - v, -v);
        dfs(`${expr}*${digits}`, j + 1, value - lastOperand + lastOperand * v, lastOperand * v);
      }
    }
  }
}

function hammingCodesIntegerToEncodedBinary(n: number) {
  // convert number to binary string
  const data = n.toString(2).split('');
  const dataSize = data.length;

  // calculate parity bits and total bits
  let m = 0;
  while ((1 << m) - m - 1 <= dataSize) {
    m += 1;
  }
  const globalParityBit = 1;
  const parityBits = m + globalParityBit;
  const totalBits = dataSize + parityBits;

  // fill data bits
  const code = Array(totalBits).fill('_');
  for (let i = 1; i < code.length; i++) {
    // skip power-of-two indices
    if ((i & (i - 1)) === 0) {
      continue;
    }

    code[i] = data.shift();
  }

  // fill parity bits at power-of-two positions
  for (let i = 1; i < code.length; i <<= 1) {
    let xor = 0;
    for (let j = i + 1; j < code.length; j++) {
      if ((((j - i) / i) & 1) === 0) {
        xor ^= code[j];
      }
    }
    code[i] = xor;
  }

  // set global parity bit at index 0
  let xor = 0;
  for (let i = 1; i < code.length; i++) {
    xor ^= code[i];
  }
  code[0] = xor;

  return code.join('');
}

export function proper2ColoringOfAGraph([n, edges]: [number, number[][]]) {
  const adj: number[][] = Array(n).fill(null).map(() => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }

  const color = Array(n).fill(-1)
  for (let i = 0; i < n; i++) {
    if (color[i] == -1 && !colorNode(i, 0)) {
      return []
    }
  }
  return color

  function colorNode(n: number, c: number): boolean {
    if (color[n] == c) {
      return true
    }

    color[n] = c

    for (const next of adj[n]) {
      if (color[next] == color[n] || !colorNode(next, 1 - color[n])) {
        return false
      }
    }
    return true
  }
}

export function compressionIRLECompression(s: string) {
  const runs: [number, string][] = []
  for (const c of s) {
    if (runs.length > 0 && runs[runs.length - 1][1] === c && runs[runs.length - 1][0] < 9) {
      runs[runs.length - 1][0]++;
    } else {
      runs.push([1, c]);
    }
  }
  return runs.flat().join('');
}

export function compressionIILZDecompression(s: string) {
  let result = ``;
  let isType1 = true
  for (let i = 0; i < s.length; isType1 = !isType1) {
    const length = parseInt(s[i++]);
    if (length == 0) {
      continue
    }

    if (isType1) {
      result += s.substring(i, i + length);
      i += length;
    } else {
      const offset = parseInt(s[i++]);
      for (let j = 0; j < length; j++) {
        result += result[result.length - offset];
      }
    }
  }
  return result;
}

export function encryptionICaesarCipher([plaintext, leftShift]: [string, number]) {
  const c2i = (c: string) => c.charCodeAt(0) - 'A'.charCodeAt(0)
  const i2c = (i: number) => String.fromCharCode(i + 'A'.charCodeAt(0))

  return plaintext
    .split('')
    .map(c => c == ' ' ? c : i2c((c2i(c) - leftShift + 26) % 26))
    .join('')
}

export function encryptionIIVigenereCipher([plaintext, key]: string[]) {
  const c2i = (c: string) => c.charCodeAt(0) - 'A'.charCodeAt(0)
  const i2c = (i: number) => String.fromCharCode(i + 'A'.charCodeAt(0))
  return plaintext.split('').map((c, i) => i2c((c2i(c) + c2i(key[i % key.length])) % 26)).join('')
}

export function squareRoot(i: bigint) {
  let left = 0n
  let right = i
  while (left < right) {
    const mid = left + ((right - left) >> 1n)
    if (mid * mid > i) {
      right = mid
    } else {
      left = mid + 1n
    }
  }
  const r = left
  const l = left - 1n
  return String((r * r - i) < (i - l * l) ? r : l)
}
