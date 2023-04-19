"use strict";

import "./d3@7.8.2/d3.min.js";


class Enum {
    name;

    constructor(name) {
        this.name = name;
        Object.freeze(this);
    }
}

class Directions extends Enum {
    static CW  = new Directions("順行");
    static CCW = new Directions("逆行");

    static pair(dir) {
        if(dir === this.CW) return [this.CW , this.CCW];
        else                return [this.CCW, this.CW ];
    }

    static fromID(id) {
        switch(id) {
            case  0: return this.CW;
            case  1: return this.CCW;
            default: return undefined;
        }
    }

    static fromLineDefault(line) {
        switch(line.id) {
            case "CZ"   : return this.pair(this.CCW);  /* 成追線 */
            case "EL"   : return this.pair(this.CW );  /* 東部幹線 */
            case "JJ"   : return this.pair(this.CCW);  /* 集集線 */
            case "LJ"   : return this.pair(this.CW );  /* 六家線 */
            case "NW"   : return this.pair(this.CW );  /* 內灣線 */
            case "PX"   : return this.pair(this.CW );  /* 平溪線 */
            case "SA"   : return this.pair(this.CCW);  /* 深澳線 */
            case "SH"   : return this.pair(this.CCW);  /* 沙崙線 */
            case "SL"   : return this.pair(this.CCW);  /* 南迴線 */
            case "SU"   : return this.pair(this.CW );  /* 蘇澳新-蘇澳 */
            case "WL"   : return this.pair(this.CCW);  /* 西部幹線 */
            case "WL-C" : return this.pair(this.CCW);  /* 西部幹線 (海線) */
            default     : return undefined;
        }
    }
}
Object.freeze(Directions);

class TripLines extends Enum {
    static NONE  = new TripLines("不經山海線");
    static MOUNT = new TripLines("山線");
    static COAST = new TripLines("海線");
    static CZ    = new TripLines("成追線");

    static fromID(id) {
        switch(id) {
            case  0: return this.NONE;
            case  1: return this.MOUNT;
            case  2: return this.COAST;
            case  3: return this.CZ;
            default: return undefined;
        }
    }
}
Object.freeze(TripLines);

class StationClass extends Enum {
    static SPECIAL   = new StationClass("特等");
    static FIRST     = new StationClass("一等");
    static SECOND    = new StationClass("二等");
    static THIRD     = new StationClass("三等");
    static SIMPLE    = new StationClass("簡易");
    static STAFFLESS = new StationClass("招呼");

    static fromID(id) {
        switch(id) {
            case "0": return this.SPECIAL;
            case "1": return this.FIRST;
            case "2": return this.SECOND;
            case "3": return this.THIRD;
            case "4": return this.SIMPLE;
            case "5": return this.STAFFLESS;
            default : return undefined;
        }
    }

    getColor() {
        switch(this) {
            case StationClass.SPECIAL  : return "#ff008c";
            case StationClass.FIRST    : return "#ff4444";
            case StationClass.SECOND   : return "#ff8000";
            case StationClass.THIRD    : return "#ffcc00";
            case StationClass.SIMPLE   : return "#7094db";
            case StationClass.STAFFLESS: return "#004161";
        }
    }
}
Object.freeze(StationClass);

class Station {
    id;
    name;
    staClass;
    sections;
    stopCount;
    passCount;

    constructor(id, name, staClass) {
        this.id = id;
        this.name = name;
        this.staClass = staClass;
        this.sections = [];
        this.stopCount = 0;
        this.passCount = 0;
    }
}

class Section {
    line;
    dir;
    toStation;

    constructor(line, dir, toStation) {
        this.line = line;
        this.dir = dir;
        this.toStation = toStation;
    }
}

class Line {
    id;
    name;
    isBranch;

    constructor(id, name, isBranch) {
        this.id = id;
        this.name = name;
        this.isBranch = isBranch;
    }
}

class Train {
    no;
    direction;
    tripLine;
    branches;
    stopStations;
    passStations;

    constructor(no, direction, tripLine) {
        this.no = no;
        this.direction = direction;
        this.tripLine = tripLine;
        this.branches = [];
        this.stopStations = [];
        this.passStations = [];
    }

    includeStopID(id) {
        return this.stopStations.find(sta => sta.id === id) !== undefined;
    }

    speculateBranches() {
        // 海線（應為主幹線之一部份）
        if(this.tripLine === TripLines.COAST)
            this.branches.push("WL-C");

        // 成追線
        if(this.tripLine === TripLines.CZ)
            this.branches.push("CZ");
        if(this.tripLine === TripLines.CZ &&
           this.direction === Directions.CCW)
            this.branches.push("WL-C");

        // 內灣線
        if(this.includeStopID("1193" /* 竹中 */) ||
           this.includeStopID("1203" /* 竹東 */))
            this.branches.push("NW");
    
        // 六家線
        if(this.includeStopID("1194" /* 六家 */))
            this.branches.push("LJ");
    
        // 平溪線
        if(this.includeStopID("7332" /* 十分 */))
            this.branches.push("PX");

        // 深澳線
        if(this.includeStopID("7362" /* 八斗子 */))
            this.branches.push("SA");
    
        // 集集線
        if(this.includeStopID("3432" /* 濁水 */) ||
           this.includeStopID("3431" /* 源泉 */))
           this.branches.push("JJ");
    
        // 沙崙線
        if(this.includeStopID("4272" /* 沙崙 */))
            this.branches.push("SH");

        // 「蘇澳新 - 蘇澳」區間（應為主幹線之一部份）
        if(this.includeStopID("7120" /* 蘇澳 */))
            this.branches.push("SU");

        // 「基隆 - 八堵」區間（應為主幹線之一部份）
        if(this.includeStopID("0900" /* 基隆 */))
            this.branches.push("KL" /* NOT A STANDARD LINE ID */);
    }
}


async function loadRawData() {
    console.group("Loading Raw Data");
    console.log("Start loading...");
    console.time("All loaded");

    const [
        stations,
        lines,
        stationsOfLine,
        trains
    ] = await Promise.all([
        d3.json("../data/tdx/v3_Rail_TRA_Station.json"),
        d3.json("../data/tdx/v3_Rail_TRA_Line.json"),
        d3.json("../data/tdx/v3_Rail_TRA_StationOfLine.json"),
        d3.json("../data/tdx/v3_Rail_TRA_GeneralTrainTimetable.json")
    ]);

    console.timeEnd("All loaded");
    console.log(
        "The loaded raw data sets " +
        "(from the `Transport Data eXchange, TDX`):",
        {stations, lines, stationsOfLine, trains}
    );
    console.groupEnd();

    return {stations, lines, stationsOfLine, trains};
}

function parseRawData(rawData) {
    console.group("Parsing Raw Data");
    console.log("Start parsing...");
    console.time("All parsed");

    const stations = new Map();
    const lines    = new Map();
    const trains   = new Map();

    for(const stationRaw of rawData.stations.Stations) {
        const station = new Station(
            stationRaw.StationID,
            stationRaw.StationName.Zh_tw,
            StationClass.fromID(stationRaw.StationClass)
        );
        stations.set(station.id, station);
    }

    for(const lineRaw of rawData.lines.Lines) {
        const line = new Line(
            lineRaw.LineID, lineRaw.LineName.Zh_tw, lineRaw.IsBranch);
        lines.set(line.id, line);
    }

    for(const lineRaw of rawData.stationsOfLine.StationOfLines) {
        const line = lines.get(lineRaw.LineID);
        const [nextDir, prevDir] = Directions.fromLineDefault(line);
        d3.pairs(
            Array.from(lineRaw.Stations, d => stations.get(d.StationID)),
            (aSta, bSta) => {
                aSta.sections.push(new Section(line, nextDir, bSta));
                bSta.sections.push(new Section(line, prevDir, aSta));
            }
        );
    }

    for(const trainRaw of rawData.trains.TrainTimetables) {
        const train = new Train(
            trainRaw.TrainInfo.TrainNo,
            Directions.fromID(trainRaw.TrainInfo.Direction),
            TripLines.fromID(trainRaw.TrainInfo.TripLine)
        );
        train.stopStations = Array.from(
            trainRaw.StopTimes, d => stations.get(d.StationID));
        trains.set(train.no, train);
    }

    postParseRawData({stations, lines, trains});

    console.timeEnd("All parsed");
    console.log("The parsed data:", {stations, lines, trains});
    console.groupEnd();

    return {stations, lines, trains};
}

function postParseRawData({stations, lines, trains}) {
    // 「潮州基地」站處理：不位於路線中，直接移除
    stations.delete("5999" /* 潮州基地 */);

    // 海線處理：去主線化
    lines.get("WL-C").isBranch = false;

    // 「蘇澳新 - 蘇澳」區間處理：去主線化
    lines.get("SU").isBranch = true;

    // 「基隆 - 八堵」區間處理：建立並替換新路線
    const klLine = new Line("KL", "基隆-八堵", true);
    lines.set(klLine.id, klLine);
    const klStations = [
        stations.get("0900" /* 基隆 */),
        stations.get("0910" /* 三坑 */),
        stations.get("0920" /* 八堵 */)
    ];
    klStations.forEach(sta => {
        sta.sections = sta.sections.filter(
            sec => !klStations.includes(sec.toStation));
    });
    d3.pairs(
        klStations,
        (aSta, bSta) => {
            aSta.sections.push(new Section(klLine, Directions.CCW, bSta));
            bSta.sections.push(new Section(klLine, Directions.CW , aSta));
        }
    );

    // 偵測分歧情況
    for(const train of trains.values()) train.speculateBranches();
}

function findPassedStations({stations, lines, trains}) {
    console.group("Finding Passed Stations");
    console.log("Start finded...");
    console.time("All founded");

    for(const train of trains.values()) {
        const trace = {
            dir: (train.tripLine === TripLines.CZ ?
                  Directions.CCW : train.direction),
            sta: {prev: undefined, curr: undefined, next: undefined}
        };
        d3.pairs(
            train.stopStations,
            (fromStation, toStation) =>
                tracePassedStations(train, trace, fromStation, toStation)
        );
        train.passStations.push(trace.sta.next);
    }

    countTrainStations({trains});

    console.timeEnd("All founded");
    console.log(
        "The stations with stoping and passing counts, " +
        "and the trains with the founded passed stations:",
        {stations, trains}
    );
    console.groupEnd();
}

function tracePassedStations(train, trace, fromStation, toStation) {
    if(trace.sta.next === undefined) trace.sta.next = fromStation;

    while(trace.sta.next !== toStation) {
        trace.sta.prev = trace.sta.curr;
        trace.sta.curr = trace.sta.next;
        trace.sta.next = undefined;

        train.passStations.push(trace.sta.curr);
        if(train.passStations.length > 500) {
            console.error("Too many stations traced:", train, trace);
            break;
        }

        // 成追線特別處理：成追線列車之順逆行定義特殊，在此需於追分站轉換順逆行方向
        if(train.tripLine === TripLines.CZ &&
           trace.sta.curr.id === "2260" /* 追分 */)
            [, trace.dir] = Directions.pair(trace.dir);

        const secs = trace.sta.curr.sections.filter(sec =>
            sec.dir === trace.dir && sec.toStation !== trace.sta.prev
        );

        if(secs.length === 1) trace.sta.next = secs[0].toStation;
        else {
            // 若無符合支線，則優先行主幹線，再尋找其他支線
            let sec = secs.find(sec => train.branches.includes(sec.line.id));
            if(sec === undefined) sec = secs.find(sec => !sec.line.isBranch);
            if(sec === undefined) sec = secs.find(sec =>  sec.line.isBranch);

            trace.sta.next = sec.toStation;
        }

        if(trace.sta.next === undefined) {
            console.error("Next station not found:", train, trace);
            break;
        }
    }
}

function countTrainStations({trains}) {
    for(const train of trains.values()) {
        for(const stopSta of train.stopStations) stopSta.stopCount++;
        for(const passSta of train.passStations) passSta.passCount++;
    }
}

function prepareBarChartData({stations}) {
    console.group("Preparing Bar Chart Data");
    console.log("Start preparing...");
    console.time("All prepared");

    const stationCounts = Array.from(
        stations.values(),
        sta => ({
            name: sta.name,
            staClass: sta.staClass,
            stopPassRatio: sta.stopCount / sta.passCount
        })
    );
    stationCounts.sort(
        (a, b) => b.stopPassRatio - a.stopPassRatio
    );

    console.timeEnd("All prepared");
    console.log("The bar chart data:", {stationCounts});
    console.groupEnd();

    return stationCounts;
}

function setupCanvas(stationCounts) {
    console.group("Setting Up Canvas");
    console.log("Starting setting up...");
    console.time("All setup");

    const svg_width  =  800;
    const svg_height = 3300;
    const chart_margin = {top: 120, right: 40, bottom: 40, left: 80};
    const chart_width  = svg_width  - (chart_margin.left + chart_margin.right );
    const chart_height = svg_height - (chart_margin.top  + chart_margin.bottom);

    const this_svg = d3.select(".bar-chart-container")
        .append("svg")
        .attr("width", svg_width).attr("height", svg_height)
        .append("g")
        .attr("transform", `translate(${chart_margin.left}, ${chart_margin.top})`);

    const xMax = d3.max(stationCounts, d => d.stopPassRatio);
    const xScale = d3.scaleLinear([0, xMax], [0, chart_width]);
    const yScale = d3.scaleBand()
        .domain(stationCounts.map(d => d.name))
        .rangeRound([0, chart_height])
        .paddingInner(0);

    /**
     * Drawing
     */
    const bars = this_svg.selectAll(".bar")
        .data(stationCounts)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.name))
        .attr("width", d => xScale(d.stopPassRatio))
        .attr("height", yScale.bandwidth())
        .style("fill", d => d.staClass.getColor());

    const header = this_svg
        .append("g")
        .attr("class", "bar-header")
        .attr("transform", `translate(0,${-chart_margin.top / 2})`)
        .append("text")
        .attr("fill", "currentColor");
    header.append("tspan").text("臺鐵車站及其列車停靠經過比")
        .style("font-weight", "bold");
    header.append("tspan").text(`共 ${stationCounts.length} 個車站`)
        .style("font-size", "0.8em").attr("x", 0).attr("y", 20);

    /**
     * Axes
     */
    const xAxis = d3.axisTop(xScale)
        .tickSizeInner(-chart_height).tickSizeOuter(0);
    const xAxisDraw = this_svg
        .append("g").attr("class", "x axis").call(xAxis);
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisDraw = this_svg
        .append("g").attr("class", "y axis").call(yAxis);
    yAxisDraw.selectAll("text").attr("dx", "-0.6em");

    console.timeEnd("All setup");
    console.log(`The canvas setup for \"${".bar-chart-container"}\"`);
    console.groupEnd();
}

function ready({stations, lines, trains}) {
    findPassedStations({stations, lines, trains});
    const stationCounts = prepareBarChartData({stations});
    setupCanvas(stationCounts);
}


loadRawData().then(
    rawData => {
        ready(parseRawData(rawData));
    }
);
