import type { Segment } from '../types.d.ts';

import { pointsAreDifferent } from '../math/pointsAreDifferent.ts';
import { pointToString } from '../math/pointToString.ts';

const pointsByCommand = {
	c: 6,
	h: 1,
	m: 2,
	s: 4,
	v: 1,
} as Record<string, number>;

/**
 * Translate SVGPathElement `d` attribute data to coordinates
 * {@link https://www.w3.org/TR/SVG2/paths.html#PathDataMovetoCommands}
 */
export class PathNavigator {
	static fromData(commandString: string) {
		const navigator = new PathNavigator();
		navigator.execute(commandString);
		return navigator;
	}

	cursor = { x: 0, y: 0 };
	get isOpen() {
		const first = this.segments[0][0];
		return pointsAreDifferent(first, this.cursor);
	}
	segmentCurrent: Segment = [];
	segmentLast: Segment = [];
	segments: Array<Segment> = [];

	close() {
		return this;
	}

	command(command: string, ...values: Array<number>): PathNavigator {
		try {
			switch (command) {
				case `C`:
					const [handle1X, handle1Y, handle2X, handle2Y, endX, endY] = values;
					return this.curveto(handle1X, handle1Y, handle2X, handle2Y, endX, endY);
				case `c`: {
					const [handle1X, handle1Y, handle2X, handle2Y, endX, endY] = values;
					return this.curveto(
						this.cursor.x + handle1X,
						this.cursor.y + handle1Y,
						this.cursor.x + handle2X,
						this.cursor.y + handle2Y,
						this.cursor.x + endX,
						this.cursor.y + endY,
					);
				}
				case `H`: {
					const [x] = values;
					return this.lineto(x, this.cursor.y);
				}
				case `h`: {
					const [changeX] = values;
					return this.lineto(this.cursor.x + changeX, this.cursor.y);
				}
				case `L`: {
					const [x, y] = values;
					return this.lineto(x, y);
				}
				case `l`: {
					const [changeX, changeY] = values;
					return this.lineto(this.cursor.x + changeX, this.cursor.y + changeY);
				}
				case `M`: {
					const [x, y] = values;
					return this.moveto(x, y);
				}
				case `m`: {
					const [changeX, changeY] = values;
					return this.moveto(this.cursor.x + changeX, this.cursor.y + changeY);
				}
				case `S`:
				case `s`: {
					let [handle1X, handle1Y] = [this.cursor.x, this.cursor.y];
					if (this.segmentLast.length > 2) {
						const changeX = this.segmentLast[3].x - this.segmentLast[2].x;
						const changeY = this.segmentLast[3].y - this.segmentLast[2].y;
						handle1X = this.cursor.x + changeX;
						handle1Y = this.cursor.y + changeY;
					}

					let [handle2X, handle2Y, endX, endY] = values;

					if (command === `s`) {
						handle2X += this.cursor.x;
						handle2Y += this.cursor.y;
						endX += this.cursor.x;
						endY += this.cursor.y;
					}

					return this.curveto(handle1X, handle1Y, handle2X, handle2Y, endX, endY);
				}
				case `V`: {
					const [y] = values;
					return this.lineto(this.cursor.x, y);
				}
				case `v`: {
					const [changeY] = values;
					return this.lineto(this.cursor.x, this.cursor.y + changeY);
				}
				case `Z`: {
					return this.close();
				}
				default:
					throw new Error(`not a recognized command`);
			}
		} catch (error) {
			const { message } = error as Error;
			throw new Error(`Error at '${command} ${values.join(`,`)}': ${message}`);
		}
	}

	curveto(
		handle1X: number,
		handle1Y: number,
		handle2X: number,
		handle2Y: number,
		endX: number,
		endY: number,
	) {
		this.read();
		this.moveto(handle1X, handle1Y).read();
		this.moveto(handle2X, handle2Y).read();
		this.moveto(endX, endY).read();
		this.nextSegment();
		return this;
	}

	execute(commandString: string) {
		const commands = commandString.trim().split(/(?=[a-z])/gi);
		for (const chunk of commands) {
			const command = chunk.substring(0, 1);
			const points = chunk.substring(1)
				.trim()
				.replaceAll(/(?<=\d)-(?=\d)/g, ` -`) // Hyphen is used as a combined separator and negative
				.split(/[,\s]/).map(Number);
			const groupSize = pointsByCommand[command.toLowerCase()] ?? 0;
			if (groupSize === 0) {
				this.command(command);
				continue;
			}

			const groupsQty = Math.round(points.length / groupSize);
			let groupNum = 0;
			while (groupNum < groupsQty) {
				const index = groupNum * groupSize;
				this.command(command, ...points.slice(index, index + groupSize));

				groupNum += 1;
			}
		}
	}

	lineto(x: number, y: number) {
		this.read();
		this.moveto(x, y).read();
		this.nextSegment();
		return this;
	}

	moveto(x: number, y: number) {
		this.cursor.x = x;
		this.cursor.y = y;
		return this;
	}

	nextSegment() {
		this.segments.push(this.segmentCurrent);
		this.segmentLast = this.segmentCurrent;
		this.segmentCurrent = [];
	}

	read() {
		const { x, y } = this.cursor;
		if (!Number.isInteger(x)) {
			throw new Error(`x is ${x}`);
		}
		if (!Number.isInteger(y)) {
			throw new Error(`y is ${y}`);
		}
		this.segmentCurrent.push({ x, y });
		return this;
	}

	toString() {
		return this.segments.map(segment => segment.map(pointToString).join(` `)).join(`\n`);
	}
}
