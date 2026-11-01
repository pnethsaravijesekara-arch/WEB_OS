// Recursive descent, deliberately limited to arithmetic.
export function calculate(source:string):number{
  if(source.length>150)throw Error('Expression is too long.');
  const input=source.replace(/[×÷−]/g,c=>({'×':'*','÷':'/','−':'-'}[c]!)).replace(/\s+/g,'');
  let pos=0;
  function atom():number{
    if(input[pos]==='+'){pos++;return atom();}if(input[pos]==='-'){pos++;return -atom();}
    if(input[pos]==='('){pos++;const x=sum();if(input[pos++]!==')')throw Error('Missing closing parenthesis.');return x;}
    const token=input.slice(pos).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
    if(!token)throw Error('Check the expression.');pos+=token[0].length;return Number(token[0]);
  }
  function product():number{let n=atom();while(input[pos]==='*'||input[pos]==='/'){const op=input[pos++],v=atom();if(op==='/'&&v===0)throw Error('Cannot divide by zero.');n=op==='*'?n*v:n/v;}return n;}
  function sum():number{let n=product();while(input[pos]==='+'||input[pos]==='-'){const op=input[pos++],v=product();n=op==='+'?n+v:n-v;}return n;}
  const result=sum();if(pos!==input.length||!Number.isFinite(result))throw Error('Check the expression.');return Number(result.toPrecision(12));
}
