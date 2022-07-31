let positionsMap = [
	// 1 Fishy
	"1awF", "1bwF", "1cwF", "1dwF", "1ewF", "1fwF", "1gwF", "1hwF",
	"2awF", "2bwF", "2cwF", "2dwF", "2ewF", "2fwF", "2gwF", "2hwF",
	"3awF", "3bwF", "3cwF", "3dwF", "3ewF", "3fwF", "3gwF", "3hwF",
	"4awF", "4bwF", "4cwF", "4dwF", "4ewF", "4fwF", "4gwF", "4hwF",
	"5awF", "5bwF", "5cwF", "5dwF", "5ewF", "5fwF", "5gwF", "5hwF",
	"6awF", "6bwF", "6cwF", "6dwF", "6ewF", "6fwF", "6gwF", "6hwF",
	"7awF", "7bwF", "7cwF", "7dwF", "7ewF", "7fwF", "7gwF", "7hwF",
	"8awF", "8bwF", "8cwF", "8dwF", "8ewF", "8fwF", "8gwF", "8hwF",
	// 2 Fishy
	"1abF", "1bbF", "1cbF", "1dbF", "1ebF", "1fbF", "1gbF", "1hbF",
	"2abF", "2bbF", "2cbF", "2dbF", "2ebF", "2fbF", "2gbF", "2hbF",
	"3abF", "3bbF", "3cbF", "3dbF", "3ebF", "3fbF", "3gbF", "3hbF",
	"4abF", "4bbF", "4cbF", "4dbF", "4ebF", "4fbF", "4gbF", "4hbF",
	"5abF", "5bbF", "5cbF", "5dbF", "5ebF", "5fbF", "5gbF", "5hbF",
	"6abF", "6bbF", "6cbF", "6dbF", "6ebF", "6fbF", "6gbF", "6hbF",
	"7abF", "7bbF", "7cbF", "7dbF", "7ebF", "7fbF", "7gbF", "7hbF",
	"8abF", "8bbF", "8cbF", "8dbF", "8ebF", "8fbF", "8gbF", "8hbF",
	// 2 Queen
	"1awQ", "1bwQ", "1cwQ", "1dwQ", "1ewQ", "1fwQ", "1gwQ", "1hwQ",
	"2awQ", "2bwQ", "2cwQ", "2dwQ", "2ewQ", "2fwQ", "2gwQ", "2hwQ",
	"3awQ", "3bwQ", "3cwQ", "3dwQ", "3ewQ", "3fwQ", "3gwQ", "3hwQ",
	"4awQ", "4bwQ", "4cwQ", "4dwQ", "4ewQ", "4fwQ", "4gwQ", "4hwQ",
	"5awQ", "5bwQ", "5cwQ", "5dwQ", "5ewQ", "5fwQ", "5gwQ", "5hwQ",
	"6awQ", "6bwQ", "6cwQ", "6dwQ", "6ewQ", "6fwQ", "6gwQ", "6hwQ",
	"7awQ", "7bwQ", "7cwQ", "7dwQ", "7ewQ", "7fwQ", "7gwQ", "7hwQ",
	"8awQ", "8bwQ", "8cwQ", "8dwQ", "8ewQ", "8fwQ", "8gwQ", "8hwQ",
	// 3 Queen
	"1abQ", "1bbQ", "1cbQ", "1dbQ", "1ebQ", "1fbQ", "1gbQ", "1hbQ",
	"2abQ", "2bbQ", "2cbQ", "2dbQ", "2ebQ", "2fbQ", "2gbQ", "2hbQ",
	"3abQ", "3bbQ", "3cbQ", "3dbQ", "3ebQ", "3fbQ", "3gbQ", "3hbQ",
	"4abQ", "4bbQ", "4cbQ", "4dbQ", "4ebQ", "4fbQ", "4gbQ", "4hbQ",
	"5abQ", "5bbQ", "5cbQ", "5dbQ", "5ebQ", "5fbQ", "5gbQ", "5hbQ",
	"6abQ", "6bbQ", "6cbQ", "6dbQ", "6ebQ", "6fbQ", "6gbQ", "6hbQ",
	"7abQ", "7bbQ", "7cbQ", "7dbQ", "7ebQ", "7fbQ", "7gbQ", "7hbQ",
	"8abQ", "8bbQ", "8cbQ", "8dbQ", "8ebQ", "8fbQ", "8gbQ", "8hbQ",
	// 4 Fishy Queen
	"1awFQ", "1bwFQ", "1cwFQ", "1dwFQ", "1ewFQ", "1fwFQ", "1gwFQ", "1hwFQ",
	"2awFQ", "2bwFQ", "2cwFQ", "2dwFQ", "2ewFQ", "2fwFQ", "2gwFQ", "2hwFQ",
	"3awFQ", "3bwFQ", "3cwFQ", "3dwFQ", "3ewFQ", "3fwFQ", "3gwFQ", "3hwFQ",
	"4awFQ", "4bwFQ", "4cwFQ", "4dwFQ", "4ewFQ", "4fwFQ", "4gwFQ", "4hwFQ",
	"5awFQ", "5bwFQ", "5cwFQ", "5dwFQ", "5ewFQ", "5fwFQ", "5gwFQ", "5hwFQ",
	"6awFQ", "6bwFQ", "6cwFQ", "6dwFQ", "6ewFQ", "6fwFQ", "6gwFQ", "6hwFQ",
	"7awFQ", "7bwFQ", "7cwFQ", "7dwFQ", "7ewFQ", "7fwFQ", "7gwFQ", "7hwFQ",
	"8awFQ", "8bwFQ", "8cwFQ", "8dwFQ", "8ewFQ", "8fwFQ", "8gwFQ", "8hwFQ",
	// 5 Fishy Queen
	"1abFQ", "1bbFQ", "1cbFQ", "1dbFQ", "1ebFQ", "1fbFQ", "1gbFQ", "1hbFQ",
	"2abFQ", "2bbFQ", "2cbFQ", "2dbFQ", "2ebFQ", "2fbFQ", "2gbFQ", "2hbFQ",
	"3abFQ", "3bbFQ", "3cbFQ", "3dbFQ", "3ebFQ", "3fbFQ", "3gbFQ", "3hbFQ",
	"4abFQ", "4bbFQ", "4cbFQ", "4dbFQ", "4ebFQ", "4fbFQ", "4gbFQ", "4hbFQ",
	"5abFQ", "5bbFQ", "5cbFQ", "5dbFQ", "5ebFQ", "5fbFQ", "5gbFQ", "5hbFQ",
	"6abFQ", "6bbFQ", "6cbFQ", "6dbFQ", "6ebFQ", "6fbFQ", "6gbFQ", "6hbFQ",
	"7abFQ", "7bbFQ", "7cbFQ", "7dbFQ", "7ebFQ", "7fbFQ", "7gbFQ", "7hbFQ",
	"8abFQ", "8bbFQ", "8cbFQ", "8dbFQ", "8ebFQ", "8fbFQ", "8gbFQ", "8hbFQ",
	// 5 Rook
	"1awR", "1bwR", "1cwR", "1dwR", "1ewR", "1fwR", "1gwR", "1hwR",
	"2awR", "2bwR", "2cwR", "2dwR", "2ewR", "2fwR", "2gwR", "2hwR",
	"3awR", "3bwR", "3cwR", "3dwR", "3ewR", "3fwR", "3gwR", "3hwR",
	"4awR", "4bwR", "4cwR", "4dwR", "4ewR", "4fwR", "4gwR", "4hwR",
	"5awR", "5bwR", "5cwR", "5dwR", "5ewR", "5fwR", "5gwR", "5hwR",
	"6awR", "6bwR", "6cwR", "6dwR", "6ewR", "6fwR", "6gwR", "6hwR",
	"7awR", "7bwR", "7cwR", "7dwR", "7ewR", "7fwR", "7gwR", "7hwR",
	"8awR", "8bwR", "8cwR", "8dwR", "8ewR", "8fwR", "8gwR", "8hwR",
	// 6 Rook
	"1abR", "1bbR", "1cbR", "1dbR", "1ebR", "1fbR", "1gbR", "1hbR",
	"2abR", "2bbR", "2cbR", "2dbR", "2ebR", "2fbR", "2gbR", "2hbR",
	"3abR", "3bbR", "3cbR", "3dbR", "3ebR", "3fbR", "3gbR", "3hbR",
	"4abR", "4bbR", "4cbR", "4dbR", "4ebR", "4fbR", "4gbR", "4hbR",
	"5abR", "5bbR", "5cbR", "5dbR", "5ebR", "5fbR", "5gbR", "5hbR",
	"6abR", "6bbR", "6cbR", "6dbR", "6ebR", "6fbR", "6gbR", "6hbR",
	"7abR", "7bbR", "7cbR", "7dbR", "7ebR", "7fbR", "7gbR", "7hbR",
	"8abR", "8bbR", "8cbR", "8dbR", "8ebR", "8fbR", "8gbR", "8hbR",
	// 7 Monkey
	"1awM", "1bwM", "1cwM", "1dwM", "1ewM", "1fwM", "1gwM", "1hwM",
	"2awM", "2bwM", "2cwM", "2dwM", "2ewM", "2fwM", "2gwM", "2hwM",
	"3awM", "3bwM", "3cwM", "3dwM", "3ewM", "3fwM", "3gwM", "3hwM",
	"4awM", "4bwM", "4cwM", "4dwM", "4ewM", "4fwM", "4gwM", "4hwM",
	"5awM", "5bwM", "5cwM", "5dwM", "5ewM", "5fwM", "5gwM", "5hwM",
	"6awM", "6bwM", "6cwM", "6dwM", "6ewM", "6fwM", "6gwM", "6hwM",
	"7awM", "7bwM", "7cwM", "7dwM", "7ewM", "7fwM", "7gwM", "7hwM",
	"8awM", "8bwM", "8cwM", "8dwM", "8ewM", "8fwM", "8gwM", "8hwM",
	// 8 Monkey
	"1abM", "1bbM", "1cbM", "1dbM", "1ebM", "1fbM", "1gbM", "1hbM",
	"2abM", "2bbM", "2cbM", "2dbM", "2ebM", "2fbM", "2gbM", "2hbM",
	"3abM", "3bbM", "3cbM", "3dbM", "3ebM", "3fbM", "3gbM", "3hbM",
	"4abM", "4bbM", "4cbM", "4dbM", "4ebM", "4fbM", "4gbM", "4hbM",
	"5abM", "5bbM", "5cbM", "5dbM", "5ebM", "5fbM", "5gbM", "5hbM",
	"6abM", "6bbM", "6cbM", "6dbM", "6ebM", "6fbM", "6gbM", "6hbM",
	"7abM", "7bbM", "7cbM", "7dbM", "7ebM", "7fbM", "7gbM", "7hbM",
	"8abM", "8bbM", "8cbM", "8dbM", "8ebM", "8fbM", "8gbM", "8hbM",
	// 9 Monkey^
	"1awM^", "1bwM^", "1cwM^", "1dwM^", "1ewM^", "1fwM^", "1gwM^", "1hwM^",
	"2awM^", "2bwM^", "2cwM^", "2dwM^", "2ewM^", "2fwM^", "2gwM^", "2hwM^",
	"3awM^", "3bwM^", "3cwM^", "3dwM^", "3ewM^", "3fwM^", "3gwM^", "3hwM^",
	"4awM^", "4bwM^", "4cwM^", "4dwM^", "4ewM^", "4fwM^", "4gwM^", "4hwM^",
	"5awM^", "5bwM^", "5cwM^", "5dwM^", "5ewM^", "5fwM^", "5gwM^", "5hwM^",
	"6awM^", "6bwM^", "6cwM^", "6dwM^", "6ewM^", "6fwM^", "6gwM^", "6hwM^",
	"7awM^", "7bwM^", "7cwM^", "7dwM^", "7ewM^", "7fwM^", "7gwM^", "7hwM^",
	"8awM^", "8bwM^", "8cwM^", "8dwM^", "8ewM^", "8fwM^", "8gwM^", "8hwM^",
	// 10 Monkey^
	"1abM^", "1bbM^", "1cbM^", "1dbM^", "1ebM^", "1fbM^", "1gbM^", "1hbM^",
	"2abM^", "2bbM^", "2cbM^", "2dbM^", "2ebM^", "2fbM^", "2gbM^", "2hbM^",
	"3abM^", "3bbM^", "3cbM^", "3dbM^", "3ebM^", "3fbM^", "3gbM^", "3hbM^",
	"4abM^", "4bbM^", "4cbM^", "4dbM^", "4ebM^", "4fbM^", "4gbM^", "4hbM^",
	"5abM^", "5bbM^", "5cbM^", "5dbM^", "5ebM^", "5fbM^", "5gbM^", "5hbM^",
	"6abM^", "6bbM^", "6cbM^", "6dbM^", "6ebM^", "6fbM^", "6gbM^", "6hbM^",
	"7abM^", "7bbM^", "7cbM^", "7dbM^", "7ebM^", "7fbM^", "7gbM^", "7hbM^",
	"8abM^", "8bbM^", "8cbM^", "8dbM^", "8ebM^", "8fbM^", "8gbM^", "8hbM^",
	// 11 King
	"1awK", "1bwK", "1cwK", "1dwK", "1ewK", "1fwK", "1gwK", "1hwK",
	"2awK", "2bwK", "2cwK", "2dwK", "2ewK", "2fwK", "2gwK", "2hwK",
	"3awK", "3bwK", "3cwK", "3dwK", "3ewK", "3fwK", "3gwK", "3hwK",
	"4awK", "4bwK", "4cwK", "4dwK", "4ewK", "4fwK", "4gwK", "4hwK",
	"5awK", "5bwK", "5cwK", "5dwK", "5ewK", "5fwK", "5gwK", "5hwK",
	"6awK", "6bwK", "6cwK", "6dwK", "6ewK", "6fwK", "6gwK", "6hwK",
	"7awK", "7bwK", "7cwK", "7dwK", "7ewK", "7fwK", "7gwK", "7hwK",
	"8awK", "8bwK", "8cwK", "8dwK", "8ewK", "8fwK", "8gwK", "8hwK",
	// 12 King
	"1abK", "1bbK", "1cbK", "1dbK", "1ebK", "1fbK", "1gbK", "1hbK",
	"2abK", "2bbK", "2cbK", "2dbK", "2ebK", "2fbK", "2gbK", "2hbK",
	"3abK", "3bbK", "3cbK", "3dbK", "3ebK", "3fbK", "3gbK", "3hbK",
	"4abK", "4bbK", "4cbK", "4dbK", "4ebK", "4fbK", "4gbK", "4hbK",
	"5abK", "5bbK", "5cbK", "5dbK", "5ebK", "5fbK", "5gbK", "5hbK",
	"6abK", "6bbK", "6cbK", "6dbK", "6ebK", "6fbK", "6gbK", "6hbK",
	"7abK", "7bbK", "7cbK", "7dbK", "7ebK", "7fbK", "7gbK", "7hbK",
	"8abK", "8bbK", "8cbK", "8dbK", "8ebK", "8fbK", "8gbK", "8hbK",
	// 13 King^
	"1awK^", "1bwK^", "1cwK^", "1dwK^", "1ewK^", "1fwK^", "1gwK^", "1hwK^",
	"2awK^", "2bwK^", "2cwK^", "2dwK^", "2ewK^", "2fwK^", "2gwK^", "2hwK^",
	"3awK^", "3bwK^", "3cwK^", "3dwK^", "3ewK^", "3fwK^", "3gwK^", "3hwK^",
	"4awK^", "4bwK^", "4cwK^", "4dwK^", "4ewK^", "4fwK^", "4gwK^", "4hwK^",
	"5awK^", "5bwK^", "5cwK^", "5dwK^", "5ewK^", "5fwK^", "5gwK^", "5hwK^",
	"6awK^", "6bwK^", "6cwK^", "6dwK^", "6ewK^", "6fwK^", "6gwK^", "6hwK^",
	"7awK^", "7bwK^", "7cwK^", "7dwK^", "7ewK^", "7fwK^", "7gwK^", "7hwK^",
	"8awK^", "8bwK^", "8cwK^", "8dwK^", "8ewK^", "8fwK^", "8gwK^", "8hwK^",
	// 14 King^
	"1abK^", "1bbK^", "1cbK^", "1dbK^", "1ebK^", "1fbK^", "1gbK^", "1hbK^",
	"2abK^", "2bbK^", "2cbK^", "2dbK^", "2ebK^", "2fbK^", "2gbK^", "2hbK^",
	"3abK^", "3bbK^", "3cbK^", "3dbK^", "3ebK^", "3fbK^", "3gbK^", "3hbK^",
	"4abK^", "4bbK^", "4cbK^", "4dbK^", "4ebK^", "4fbK^", "4gbK^", "4hbK^",
	"5abK^", "5bbK^", "5cbK^", "5dbK^", "5ebK^", "5fbK^", "5gbK^", "5hbK^",
	"6abK^", "6bbK^", "6cbK^", "6dbK^", "6ebK^", "6fbK^", "6gbK^", "6hbK^",
	"7abK^", "7bbK^", "7cbK^", "7dbK^", "7ebK^", "7fbK^", "7gbK^", "7hbK^",
	"8abK^", "8bbK^", "8cbK^", "8dbK^", "8ebK^", "8fbK^", "8gbK^", "8hbK^",
	// 15 bear
	"1aB", "1bB", "1cB", "1dB", "1eB", "1fB", "1gB", "1hB",
	"2aB", "2bB", "2cB", "2dB", "2eB", "2fB", "2gB", "2hB",
	"3aB", "3bB", "3cB", "3dB", "3eB", "3fB", "3gB", "3hB",
	"4aB", "4bB", "4cB", "4dB", "4eB", "4fB", "4gB", "4hB",
	"5aB", "5bB", "5cB", "5dB", "5eB", "5fB", "5gB", "5hB",
	"6aB", "6bB", "6cB", "6dB", "6eB", "6fB", "6gB", "6hB",
	"7aB", "7bB", "7cB", "7dB", "7eB", "7fB", "7gB", "7hB",
	"8aB", "8bB", "8cB", "8dB", "8eB", "8fB", "8gB", "8hB",
	// 16 Elephant
	"2bwE", "2cwE", "2fwE", "2gwE",
	"5bwE", "5cwE", "5fwE", "5gwE",
	"8bwE", "8cwE", "8fwE", "8gwE",
	// 17 Elephant
	"1bbE", "1cbE", "1fbE", "1gbE",
	"4bbE", "4cbE", "4fbE", "4gbE",
	"7bbE", "7cbE", "7fbE", "7gbE",
	
	// exceptions
	"wj4wK", // index: 1112
	"wj5wK", // index: 1113
	"wj4wK^", // index: 1114
	"wj5wK^", // index: 1115
	"wj4wQ", // index: 1116
	"wj5wQ", // index: 1117
	"bj4bK", // index: 1118
	"bj5bK", // index: 1119
	"bj4bK^", // index: 1120
	"bj5bK^", // index: 1121
	"bj4bQ", // index: 1122
	"bj5bQ", // index: 1123
	"cB", 	// index: 1124
]