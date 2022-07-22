import Celdas from "./celdas";

const EMPTY = (() => {
    let temp = [];
    for (let i = 0; i < 81; i++) {
        temp.push(".");
    }
    return temp.join("");
})();

export default class Grid {
    constructor(input = EMPTY) {
        let currentRow;
        this.rows = [];

        for (let idx = 0; idx < input.length; idx++) {
            if (idx % 9 === 0) {
                currentRow = [];
                this.rows.push(currentRow);
            }

            currentRow.push(
                new Celdas(this.rows.length - 1, currentRow.length, input[idx])
            );
        }
    }

    toString() {
        let output = "";
        for (let i = 0; i < this.rows.length; i++) {
            if (i !== 0 && i % 3 === 0) {
                output += "---------+---------+---------\n";
            }

            let currentRow = this.rows[i];
            for (let j = 0; j < currentRow.length; j++) {
                if (j !== 0 && j % 3 === 0) {
                    output += "|";
                }

                output += " " + currentRow[j].toString() + " ";
            }

            output += "\n";
        }

        return output;
    }

    subgrids() {
        if (!this.grids) {
            this.grids = [];
            for (let i = 0; i < 9; i += 3) {
                for (let j = 0; j < 9; j += 3) {
                    this.grids.push(this.sameSubGridAs(new Celdas(i, j)));
                }
            }
        }

        return this.grids;
    }

    columns() {
        if (!this._columns) {
            this._columns = [];
            for (let i = 0; i < 9; i++) {
                this._columns.push([]);
            }
            this.rows.forEach(function(row) {
                row.forEach(function(celdas, idx) {
                    this._columns[idx].push(celdas);
                }, this);
            }, this);
        }

        return this._columns;
    }

    sameRowAs(celdas) {
        return this.rows[celdas.row];
    }

    sameColAs(celdas) {
        return this.columns()[celdas.col];
    }

    sameSubGridAs(celdas) {
        /*
            Obtenga todas las celdas en la misma "cuadrícula secundaria" que la celda dada. p.ej.
            para la celda "c" debajo de las celdas en "same_sub_grid" (que son
            marcados con una x a continuación) se devuelven junto con la celda del argumento.
            
            x x x | . . . | . . .
            x c x | . . . | . . .
            x x x | . . . | . . .
            ------+-------+------
            . . . | . . . | . . .
            . . . | . . . | . . .
            . . . | . . . | . . .
            ------+-------+------
            . . . | . . . | . . .
            . . . | . . . | . . .
            . . . | . . . | . . .
        */

        // row:
        // 0 - 2 -> 0
        // 3 - 5 -> 3
        // 6 - 8 -> 5

        // col:
        // same as above
        if (!celdas.subgrid) {
            let index = function(x) {
                if (x <= 2) {
                    return 0;
                } else if (x <= 5) {
                    return 3;
                } else {
                    return 6;
                }
            };

            let startRow = index(celdas.row),
                startCol = index(celdas.col),
                subgrid = [];
            for (let i = startRow; i < startRow + 3; i++) {
                let row = this.rows[i],
                    subGridRow = [];
                for (let j = startCol; j < startCol + 3; j++) {
                    subGridRow.push(row[j]);
                }

                subgrid.push(subGridRow);
            }
            celdas.subgrid = subgrid;
        }

        return celdas.subgrid;
    }

    unsolved() {
        return this.rows.flat().filter(c => c.value === 0);
    }

    isSolved() {
        return !this.rows.flat().some(x => x.value === 0);
    }

    peers(celdas) {
        /*
            Consigue los compañeros para la celda.
             Los compañeros de la celda "c" están 
             representados pictóricamente a continuación 
             por las celdas marcadas con "x"

            x x x | . . . | . . .
            x c x | x x x | x x x
            x x x | . . . | . . .
            ------+-------+------
            . x . | . . . | . . .
            . x . | . . . | . . .
            . x . | . . . | . . .
            ------+-------+------
            . x . | . . . | . . .
            . x . | . . . | . . .
            . x . | . . . | . . .
        */
        if (!celdas.peers) {
            celdas.peers = Array.from(
                new Set(
                    this.sameColAs(celdas)
                        .concat(this.sameRowAs(celdas))
                        .concat(this.sameSubGridAs(celdas).flat())
                        .filter(x => x !== celdas)
                )
            );
        }

        return celdas.peers;
    }

    toFlatString() {
        return this.rows
            .flat()
            .map(x => x.toString())
            .join("");
    }
}