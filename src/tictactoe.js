const Oxo = require("simple_tic_tac_toe_engine")


export function getBestMove(board){
    let list = []
    board.forEach(x=>{
        if(x == "empty"){
            list.push(0)
        }
        if(x == "O"){
            list.push(1)
        }
        if(x == "X"){
            list.push(2)
        }
    })
    console.log(list + "list")
    let oxo = new Oxo(list)
    let move = oxo.getBestMove()
    console.log(move + 'move')
    return move -1
}

