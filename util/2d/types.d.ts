export type Bezier = [Coordinate, Coordinate, Coordinate, Coordinate];

export type Coordinate = {
	x: number;
	y: number;
};

export type CoordinateLike = Array<number> | Coordinate;

export type Line = {
	begin: Coordinate;
	end: Coordinate;
};

export type LineLike = Array<Array<number> | Coordinate> | Line;

export type Segment = Array<Coordinate>;
