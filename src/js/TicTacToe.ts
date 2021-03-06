import GA from './../index';

export default class TicTacToe {
    constructor(public round = 0) {}
    setRound(round) {
        this.round = round;
    }
    row(board) {
        for (let i = 0; i < 3; i++) {
            if (board[i][0] == this.round && board[i][1] == this.round && board[i][2] == this.round)
                return 1;
        }
        return 0;
    }
    columnar(board) {
        for (let j = 0; j < 3; j++) {
            if (board[0][j] == this.round && board[1][j] == this.round && board[2][j] == this.round)
                return 1;
        }
        return 0;
    }
    diagonal(board) {
        if (board[0][0] == this.round && board[1][1] == this.round && board[2][2] == this.round)
            return 1;
        return 0;
    }
    idiagonal(board) {
        if (board[0][2] == this.round && board[1][1] == this.round && board[2][0] == this.round)
            return 1;
        return 0;
    }
    rule(board) {
        var boardFull = true;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (board[i][j] == null) {
                    boardFull = false;
                    break;
                }
            }
        }
        if (this.row(board) || this.columnar(board) || this.diagonal(board) || this.idiagonal(board))
            return 1;
        else if (boardFull) /* opponent together */
            return 0;
        else
            return -1;
    }
    decBin(n) {
        let str = "";
        switch (n) {
            case 0:
            case 1: str = "0";
        }
        str += n.toString(2);
        return str;
    }
    rand() {
        return Math.floor(Math.random() * 3);
    }
    convertIndex2Choromosome(index) {
        let ch = "";
        for(let i = 0; i < index.length; i++){
            for(let j = 0; j < index[i].length; j++)
                ch += this.decBin(index[i][j]);
        }
        return ch;
    }
    defenceRow(board){
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(board[i][j] == null && board[i][(j+1) % 3] == this.round && board[i][(j+2) % 3] == this.round)
                    return [i, j];
            }    
        }
        return null;
    }
    defenceColumnar(board){
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(board[i][j] == null && board[(i+1) % 3][j] == this.round && board[(i+2) % 3][j] == this.round)
                    return [i, j];
            }    
        }
        return null;
    }
    defenceDiagonal(board){
        for(let ij = 0; ij < 3; ij++)
            if(board[ij % 3][ij % 3] == null && board[(ij+1) % 3][(ij+1) % 3] == this.round && board[(ij+2) % 3][(ij+2) % 3] == this.round)
                return [ij % 3, ij % 3];
        return null;
    }
    defenceIDiagonal(board){
        if(board[0][2] == null && board[1][1] == this.round && board[2][0] == this.round)
            return [0, 2];
        else if(board[1][1] == null && board[0][2] == this.round && board[2][0] == this.round)
            return [1, 1];
        else if(board[2][0] == null && board[0][2] == this.round && board[1][1] == this.round)
            return [2, 0];
        return null;
    }
    defence(index){
        let board = this.convertIndex2Board(index);
        let de = this.defenceRow(board);
        if(de != null)
            return de;
        de = this.defenceColumnar(board);
        if(de != null)
            return de;
        de = this.defenceDiagonal(board);
        if(de != null)
            return de;
        de = this.defenceIDiagonal(board);
        return de;
    }
    switchRound(){
        this.setRound(this.round == 1 ? 0 : 1);
    }
    convertIndex2Board(index){
        let round = 0;
        let board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        for(let i = 0; i < index.length; i++){
            board[index[i][0]][index[i][1]] = round;
            round = round == 0 ? 1 : 0;
        }
        return board;
    }
    convertArguments2Index(args){
        let index = [];
        for (let i = 0; i < args.length; i += 2) {
            let c = [args[i], args[i + 1]];
            for (let j = 0; j < index.length; j++)
                if (c[0] == 3 || c[1] == 3 || (index[j] != undefined && index[j][0] == c[0] && index[j][1] == c[1]))
                    return -1;
            index.push(c);
        }
        return index;
    }
    run(index:Array<number>) {
        if (!index.length)
            return [this.rand(), this.rand()];
        let subChoromosome = this.convertIndex2Choromosome(index);
        let thisClass = this;
        let g = new GA([], function () {
            let game = new TicTacToe(thisClass.round);
            return game.rule(game.convertIndex2Board(game.convertArguments2Index(arguments)));
        }, 0, 100, 400, 0.15, 0.3, subChoromosome, 0);
        let subdomain = [0,3];
        g.pushDomain(subdomain, 12);
        if(subChoromosome.length >= subdomain.length * g.inputCount.length - 8)
            g.pushDomain(subdomain, 6);
        let de = this.defence(index);
        let val;
        let i = 2 * index.length;
        let it = 0;
        if(de != null){
            while(it < 5){
                val = g.eval();
                console.log("defense",subChoromosome, subChoromosome.length,val.inputs.toString(), val.answer);
                if(val.answer == 1 && val.inputs.length > i && this.isMovePlayer(i + 2) && this.isMovePlayer(i + 3))
                    return [val.inputs[i + 2], val.inputs[i + 3]];
                it++;
            }
            return de;
        }
        while (true) {
            val = g.eval();
            console.log("attack", subChoromosome, subChoromosome.length, val.inputs.toString(), val.answer);
            if (val.answer == 1 || val.answer == 0)
                return [val.inputs[i], val.inputs[i + 1]];
        }
    }
    isMovePlayer(index:number){
        let i = index % 4;
        return (!this.round && ( i == 0 || i == 1) || (this.round && (i == 2 || i == 3)));
    }
}
