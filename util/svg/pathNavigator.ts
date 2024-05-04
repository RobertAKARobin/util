import type { Coordinate } from '../types.d.ts';

type Segment = Array<Coordinate>;

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

	private segment: Segment = [];
	private segmentLast: Segment = [];
	segments: Array<Segment> = [];
	private x = 0;
	private y = 0;

	close() {
		const first = this.segments[0][0];
		if (this.x !== first.x || this.y !== first.y) {
			return this.lineto(first.x, first.y);
		}
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
					return this.curveto(handle1X, handle1Y, handle2X, handle2Y, endX, endY);
					return this;
				}
				case `H`: {
					const [x] = values;
					return this.lineto(x, this.y);
				}
				case `h`: {
					const [changeX] = values;
					return this.lineto(this.x + changeX, this.y);
				}
				case `L`: {
					const [x, y] = values;
					return this.lineto(x, y);
				}
				case `l`: {
					const [changeX, changeY] = values;
					return this.lineto(this.x + changeX, this.y + changeY);
				}
				case `M`: {
					const [x, y] = values;
					return this.moveto(x, y);
				}
				case `m`: {
					const [changeX, changeY] = values;
					return this.moveto(this.x + changeX, this.y + changeY);
				}
				case `S`:
				case `s`: {
					let [handle1X, handle1Y] = [this.x, this.y];
					if (this.segmentLast.length > 2) {
						const reflect = this.segmentLast[2];
						handle1X = this.x + (this.x - reflect.x);
						handle1Y = this.x + (this.x - reflect.y);
					}

					let [handle2X, handle2Y, endX, endY] = values;

					if (command === `s`) {
						handle2X += this.x;
						handle2Y += this.y;
						endX += this.x;
						endY += this.y;
					}

					return this.curveto(handle1X, handle1Y, handle2X, handle2Y, endX, endY);
				}
				case `V`: {
					const [y] = values;
					return this.lineto(this.x, y);
				}
				case `v`: {
					const [changeY] = values;
					return this.lineto(this.x, this.y + changeY);
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
			const points = chunk.substring(1).trim().split(/[,\s]/).map(Number);
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
		this.x = x;
		this.y = y;
		return this;
	}

	nextSegment() {
		this.segments.push(this.segment);
		this.segmentLast = this.segment;
		this.segment = [];
	}

	read() {
		const { x, y } = this;
		if (!Number.isInteger(x)) {
			throw new Error(`x is ${x}`);
		}
		if (!Number.isInteger(y)) {
			throw new Error(`y is ${y}`);
		}
		this.segment.push({ x, y });
		return this;
	}

	toPoints(options: {
		overlap?: boolean;
	} = {}) {
		const hasOverlap = options.overlap ?? false;

		const points = this.segments.flat();
		if (hasOverlap) {
			return points;
		}

		const out = [] as Array<Coordinate>;
		let last = {} as Coordinate;
		for (const point of points) {
			if (point.x !== last.x || point.y !== last.y) {
				out.push(point);
			}
			last = point;
		}
		return out;
	}

	toString() {
		return this.segments.map(segment =>
			segment.map(({ x, y }) => `${x},${y}`).join(` `)
		).join(`\n`);
	}
}
