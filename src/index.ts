export default class GA {
    GenomCounts = 0;
    chPopulations = [];
    private ng = [];
    logicFunc;
    inputCount = [];
    dec = 0;
    generationCount = 0;
    crossOverP = 0;
    mutationP = 0;
    initChromosome:String = "";
    position:Number = 0;
    populationCount = 100;
    constructor(inputCount, logic, decimal = 0, population, generationCount, crossOverP, mutationP, initChromosome:String, position:Number) {
        this.inputCount = inputCount;
        this.setPopulationCount(population);
        this.generateGenomCount(decimal);
        this.setInitChromosome(initChromosome);
        this.setPosition(position);
        this.setPopulation();
        this.logicFunc = logic;
        this.dec = decimal;
        this.setGenerationCount(generationCount);
        this.generationCount = generationCount;
        this.setCrossOverP(crossOverP);
        this.setMutaionP(mutationP);
    }
    setCrossOverP(crossOverP) {
        this.crossOverP = crossOverP;
    }
    
    setMutaionP(mutationP) {
        this.mutationP = mutationP;
    }

    setPopulation() {
        this.chPopulations = [];
        for (let i = 0; i < this.populationCount; i++)
            this.chPopulations.push(this.generateChrom());
    }

    setPopulationCount(pop){
        this.populationCount = pop;
    }

    setGenerationCount(value) {
        this.generationCount = value;
    }

    generateGenomCount(decimal) {
        let total = 0;
        this.inputCount.forEach((item, i) => {
            total += this.population(decimal, i);
        });
        this.GenomCounts = total;
    }
    generateChrom() {
        let str:String = "";
        for (let i = 0; i < this.GenomCounts; i++)
            str += Math.random() > 0.5 ? '1' : '0';
        return this.manipulateChromosome(str);
    }
    population(decimal, inputIndex) {
        return Math.ceil(Math.log2((this.inputCount[inputIndex][1] - this.inputCount[inputIndex][0]) * (Math.pow(10, decimal))));
    }
    binReal(ch, ranges) {
        return ranges[0] + this.binDec(ch) * (ranges[1] - ranges[0]) / (Math.pow(2, ch.length) - 1);
    }
    binDec(genoms) {
        let length = genoms.length - 1;
        let dec = 0;
        while (length >= 0) {
            dec += parseInt(genoms[length]) * Math.pow(2, genoms.length - length - 1);
            length--;
        }
        return dec;
    }
    eval() {
        for (let k = 0; k < this.generationCount; k++) {
            let sum = 0;
            let probablies = [];
            let qprobables = [];
            for (let i = 0; i < this.chPopulations.length; i++) {
                let results = [];
                let ch = this.chPopulations[i];
                results = this.converetChToDecimals(ch);
                let p = this.logicFunc.call(this, ...results);
                probablies.push(p);
                sum += p;
                results = [];
            }
            for (let i = 0; i < this.chPopulations.length; i++) {
                probablies[i] = sum == 0 ? 0 : probablies[i] / sum;
                qprobables[i] = 0;
                for (let j = 0; j <= i; j++) {
                    qprobables[i] += probablies[j];
                }
                const rand = Math.random();
                if (rand < qprobables[0]) this.ng.push(this.chPopulations[0]);
                for (let j = 0; j < this.chPopulations.length; j++) {

                    if (rand >= qprobables[j]) {
                        let selected = j + 1;
                        this.ng.push(this.chPopulations[selected]);
                        break;
                    }
                }
            }
            this.chPopulations = [...this.ng];
            this.ng = [];
            /* determining mutation and crossover operators in action with restriction of inital sub-chromosome */
            for (let i = 0; i < this.chPopulations.length; i++) {
                /* mutation */
                for (let j = 0; j < this.GenomCounts; j++) {
                    if (j < this.position || j >= ( this.position + this.initChromosome.length ) && Math.random() < this.mutationP) {
                        this.chPopulations[i] = this.mutation(this.chPopulations[i], j);
                    }
                }
                /* crossover */
                if (i < this.position || i >= ( this.position + this.initChromosome.length ) && Math.random() < this.crossOverP) {
                    const i1 = this.selectRandomIndex;
                    const i2 = this.selectRandomIndex;
                    const ch1 = this.chPopulations[i1];
                    const ch2 = this.chPopulations[i2];
                    const crossovered = this.crossOver(ch1, ch2);
                    this.chPopulations[i1] = crossovered[0];
                    this.chPopulations[i2] = crossovered[1];
                }
            }
        }
        let max = {
            all: [],
            answer: null,
            inputs: []
        };
        // show data
        for (let i = 0; i < this.chPopulations.length; i++) {
            let results = [];
            let ch = this.chPopulations[i];
            results = this.converetChToDecimals(ch);
            let p = this.logicFunc.call(this, ...results);
            if (max.answer == null || p > max.answer) {
                max.answer = p;
                max.inputs = results;
            }
            max.all.push({ answer: p, inputs: results });
            results = [];
        }
        return max;
    }

    crossOver(c1, c2) {
        let point = Math.ceil(Math.random() * c1.length);
        let t1 = c1.substr(point);
        let t2 = c2.substr(point);
        let d1 = c1.substr(0, point) + t2;
        let d2 = c2.substr(0, point) + t1;
        return [d1,d2];
    }

    mutation(str, j) {
        return str.substr(0, j) + (str[j] == '1' ? '0' : '1') + str.substr(j + 1);
    }

    get selectRandomIndex() {
        return Math.ceil(Math.random() * this.chPopulations.length - 1);
    }

    converetChToDecimals(ch) {
        let result = [];
        let start = 0;
        let innerChRanges = this.inputCount.map((item, index) => {
            return this.population(this.dec, index);
        });
        for (let j = 0; j < innerChRanges.length; j++) {
            let arg = ch.substr(start, innerChRanges[j]);
            start += innerChRanges[j];
            result.push(this.binReal(arg, this.inputCount[j]));
        }
        return result;
    }
    getChResult(ch){
       return this.eval(...this.converetChToDecimals(ch));
    }
    setInitChromosome(n:String){
        this.initChromosome = n;
    }
    setPosition(n:Number){
        this.position = n;
    }
    initDomain(arr){
        this.inputCount = arr;
        this.generateGenomCount(this.dec);
        this.setPopulation();
    }
    pushDomain(subdomain, iterator){
        for(let i = 0; i < iterator; i++){
            this.inputCount.push(subdomain);
        }
        this.generateGenomCount(this.dec);
        this.setPopulation();
    }
    manipulateChromosome(str:String){
        let temp:String = "";
        if(!this.initChromosome.length)
            return str;
        if(!this.position)
            temp = this.initChromosome;
        else if(this.position){
            temp += str.substr(0, this.position);
            temp += this.initChromosome;
        }
        temp += str.substr(this.position + this.initChromosome.length);
        return temp;
    }
}
