import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
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
