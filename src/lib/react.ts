import ReactNamespace from 'react';
import ReactDomNamespace from 'react-dom';

const React = eval('window.React') as typeof ReactNamespace;
const ReactDOM = eval('window.ReactDOM') as typeof ReactDomNamespace;

export default React;
export {
  ReactDOM
}