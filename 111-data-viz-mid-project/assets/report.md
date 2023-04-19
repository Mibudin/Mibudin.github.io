# **資料視覺化** <small>*(GS4514)*</small> <br>期中報告

> 劉子雍．108502523
> 
> 資訊工程學系四年級 A 班

---

***網站版，強烈推薦：https://mibudin.github.io/111-data-viz-mid-project/***

---


## 資料集簡介

### 資料集來源簡介

本專案所使用的所有資料集原本皆來自於[「公共運輸整合資訊流通服務平臺（Public Transport Data eXchange，PTX）」][ptx]（以下簡稱為 PTX 平臺）。此為交通部積極發展的平臺，與各公共運輸機關平台協作建立標準化、高效能、跨運具之公共運輸旅運開放資料服務，以 OData（Open Data Protocol）標準介面提供高品質、開放資料達四星級之公共運輸旅運資料服務 API。

不過 PTX 平臺已經宣布：因為交通部已收攏資料於[「運輸資料流通服務平臺（Transport Data eXchange，TDX）」][tdx]（交通部發展的新 Open API 服務整合平臺，以下簡稱為 TDX 平臺），以替代 PTX 平臺，所以預計將於 2022 年 12 月 1 日起結束服務[^ptx_down]。因此，此專案目前改使用 TDX 平臺作為所使用資料集的主要來源。

不過以此專案的目前工作內容與階段來說，使用 PTX 平臺抑或是 TDX 平臺做為資料集來源並沒有實質上的差別。基於以下幾點原因：

1. 對於此專案所使用的 API 分類或是其中的資料集個體來說，PTX 平臺和 TDX 平臺的 API 要求格式、資料格式、及資料內容完全一樣。至少對於所使用的資料及來說，我猜想這兩個平臺後端連接的資料來源很可能是一樣的。因此不會對於主程式中的資料處理產生影響。

2. 雖然目前 PTX 平臺已經宣告結束服務[^ptx_down]，但是根據其平臺的資料來源監控，目前其幾乎大部分的「介接來源資料」運作狀態仍然正常[^ptx_dataset_monitor]。

3. 由於對此專案成果展現時的穩定性考量，所以目前所使用到的資料集皆為先從 TDX 平臺的 API 下載下來的本地資料檔案。以避免：TDX 平臺的服務可能會因為維修等原因暫時下線、TDX 平臺對於 API 的使用有相當限制（特別是對於無會員金鑰者）[^tdx_api_swagger]、使用端環境使即時索取 TDX 平臺 API 資料有困難等等。因此在實際主程式中可以不需要對於特定平臺進行介接。

### 使用資料集簡介

本專案所使用到的資料集皆來自於 TDX 平臺基礎服務之「公共運輸－軌道（v3）」中的「TRA（臺鐵）」分類中所提供的 RESTful API。

本專案所使用到的資料集相關資訊如下表所示：

| RESTful API URL                      | 說明                         |
| :----------------------------------- | :--------------------------- |
| `/v3/Rail/TRA/Station`               | 取得車站基本資料             |
| `/v3/Rail/TRA/Line`                  | 取得路線基本資料             |
| `/v3/Rail/TRA/StationOfLine`         | 取得路線車站基本資料         |
| `/v3/Rail/TRA/GeneralTrainTimetable` | 取得所有車次的定期時刻表資料 |

更多相關資料集資訊可以至[「TDX 平臺線上 API 說明 Swagger UI」][tdx_api_swagger]的「基礎服務」:arrow_right:「公共運輸－軌道（v3）」:arrow_right:「TRA（臺鐵）」分類中查看。


## 為什麼選擇這個資料集

本專案的目的在於：**使用臺鐵公開資料，進行分析計算，然後輸出以「臺鐵車站站別」作為分類（縱軸），以「其車站對於所有列車之停靠經過比例值」作為其圖示長度（橫軸）之簡易長條圖**，並在主要程式處理流程及邏輯以及結果圖表等方面盡量模仿上課時所學習的長條圖範例[^data_viz_bar_chart]。

我本身對於公共運輸或是鐵道方面的議題就有些許的興趣，當然也因此對於在生活周遭的臺鐵有研究的意願。而在前些時候，我稍微了解過鐵路[運行圖][diagram_wiki]相關的議題[^diagram_desc]。也因此接觸[「OuDia」][oudia]、[「OuDiaSecondV2」][oudia2]、[「CloudDia」][clouddia]等日本人製作的運行圖編輯、顯示、輸出工具。我更發現由臺灣人製作的[「台灣鐵路運行圖」][tradiagram]網站工具，可以經由分析臺鐵相關公開資料來自動製作臺鐵的鐵路運行圖，以及臺鐵列車即時位置圖。這項工具網站也給予了我相當多的靈感與啟發。

不過這項課程的期中專案報告要求[^data_viz_mid_report]是要模仿上課時所教的長條圖來進行製作，所以我很快就將注意力轉移到對於此長條圖構思上。延續我之前所得到的靈感，以及我之前接觸 PTX 平臺 RESTful API 的經驗，決定使用臺鐵公開資料來進行製作（這也是為什麼我會選擇這此資料集）。後來依據上課時的長條圖範例特性，我決定使用車站與列車的相關資料，對於各個車站所停靠與經過的列車數量比例趨勢進行分析。

## 如何實作

### 整體程式架構

本專案的主要程式撰寫於 [`./assets/main.js`](https://github.com/Mibudin/Mibudin.github.io/blob/main/111-data-viz-mid-project/assets/main.js) 中，如需更多詳細資訊請查看。

此程式所宣告定義的類別如下表所示：

| 類別                              | 說明                                   |
| :-------------------------------- | :------------------------------------- |
| `class Enum`                      | 表示列舉                               |
| `class Directions extends Enum`   | 表示臺鐵列車行駛「順行／逆行」方向     |
| `class TripLines extends Enum`    | 表示臺鐵列車行駛「山線／海線／成追線」 |
| `class StationClass extends Enum` | 表示臺鐵車站等級                       |
| `class Station`                   | 表示臺鐵車站                           |
| `class Section`                   | 表示臺鐵車站之間的鐵道線路拓樸連結     |
| `class Line`                      | 表示臺鐵路線                           |
| `class Train`                     | 表示臺鐵車次及其班表                   |

此程式所宣告定義的全域方法如下表所示：

| 方法                                                                 | 說明                                   |
| :------------------------------------------------------------------- | :------------------------------------- |
| `async function loadRawData()`                                       | 讀取從 TDX 平臺 API 下載的資料集       |
| `function parseRawData(rawData)`                                     | 解析從 TDX 平臺 API 下載的資料集       |
| `function postParseRawData({stations, lines, trains})`               | 對解析後的資料進行特殊處理             |
| `function findPassedStations({stations, lines, trains})`             | 找到所有車次會經過的車站               |
| `function tracePassedStations(train, trace, fromStation, toStation)` | 找到某一車次在某一區間會經過的車站     |
| `function countTrainStations({trains})`                              | 計算所有車站被所有車次停靠經過的次數   |
| `function prepareBarChartData({stations})`                           | 將資料轉換成繪製長條圖所需的格式       |
| `function setupCanvas(stationCounts)`                                | 利用 D3 繪製長條圖                     |
| `function ready({stations, lines, trains})`                          | 對於讀取並且解析完的資料進行處理主邏輯 |

以下將會簡介主要程式方法的運作。

### `loadRawData()`

此方法主要功能為讀取從 TDX 平臺 API 下載的資料集。

其中，利用 [`d3.json`](https://github.com/d3/d3-fetch/blob/v3.0.1/README.md#json) 來讀取相關資料集 JSON 檔案。並且用 `Promise.all` 來並行讀取：
```javascript
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
```

### `parseRawData(...)`

此方法的主要功能為解析從 TDX 平臺 API 下載的資料集。

關於 TDX 平臺資料集的格式及其他相關資訊，可以至[「TDX 平臺線上 API 說明 Swagger UI」][tdx_api_swagger]的「基礎服務」:arrow_right:「公共運輸－軌道（v3）」:arrow_right:「TRA（臺鐵）」分類中查看。

首先建立要裝入車站、路線、車次等資料的 `Map`：
```javascript
const stations = new Map();
const lines    = new Map();
const trains   = new Map();
```

然後，分析車站資料集，擷取必要車站資訊，並以車站 ID 為鍵放入對應 `Map` 中：
```javascript
for(const stationRaw of rawData.stations.Stations) {
    const station = new Station(
        stationRaw.StationID,
        stationRaw.StationName.Zh_tw,
        StationClass.fromID(stationRaw.StationClass)
    );
    stations.set(station.id, station);
}
```

分析路線資料集，擷取必要路線資訊，並以路線 ID 為鍵放入對應 `Map` 中：
```javascript
for(const lineRaw of rawData.lines.Lines) {
    const line = new Line(
        lineRaw.LineID, lineRaw.LineName.Zh_tw, lineRaw.IsBranch);
    lines.set(line.id, line);
}
```

分析車次資料集，擷取必要路線資訊、尋找並儲存對應停看車站，並以車次編號為鍵放入對應 `Map` 中：
```javascript
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
```

最後，呼叫 `postParseRawData(...)` 方法來對於解析完的資料進行相關特殊處理。

### `postParseRawData(...)`

此方法的主要功能為對在 `parseRawData(...)` 中解析後的資料進行特殊處理。

首先，將不位於路線中的調度基地：「潮州基地」（編號：`5999`）直接從車站列表中移除：
```javascript
// 「潮州基地」站處理：不位於路線中，直接移除
stations.delete("5999" /* 潮州基地 */);
```

然後將海線、「蘇澳新 - 蘇澳」區間等主幹線上的分歧線標示為支線：
```javascript
// 海線處理：去主線化
lines.get("WL-C").isBranch = false;

// 「蘇澳新 - 蘇澳」區間處理：去主線化
lines.get("SU").isBranch = true;
```

其中將「基隆 - 八堵」區間從「西部幹線」中分離，另建新線，然後更新車站拓樸連結：
```javascript
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
```

最後，對於所有車次，呼叫 `speculateBranches()` 來推測這些列車所（可能）行駛的支線。

### `Train.speculateBranches()`

此方法為 `Train` 物件的方法，主要功能為依據臺鐵路網特性以及車次編排特性來推測車次。部分路網特性或車次編排特性參考自[「台灣鐵路運行圖」][tradiagram]的[程式][tradiagram_branches]。

主要支線判斷是以是否行經特定之線上的重要車站（車站等級較高或是重要調度或待避站）等規則來判斷，這些規則主要來自路網特性以及車次編排特性：
```javascript
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
```

### `findPassedStations(...)`

此方法的主要功能為找到所有車次會經過的車站。

對於所有車次，先建立 `trace` 來儲存車次路線追蹤的狀態，再利用 [`d3.pairs`](https://github.com/d3/d3-array/blob/v3.2.3/README.md#pairs) 來找到某車次停靠站之間的所有區間，然後呼叫 `tracePassedStations(...)` 來找到此區間中所有會經過的車站：
```javascript
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
```

計算完所有車次的經過車站後，呼叫 `countTrainStations(...)` 方法來計算所有車站的停靠次數和經過次數：
```javascript
countTrainStations({trains});
```

### `tracePassedStations(...)`

此方法的主要功能為找出某車次在某一區間中會經過的車站，本方法依靠 `trace` 參數來記錄相關的路線追蹤資訊。

一開始，首先先確認區間起始站的設定：
```javascript
if(trace.sta.next === undefined) trace.sta.next = fromStation;
```

然後從區間起始站開始追蹤此車次的路線：
```javascript
while(trace.sta.next !== toStation) {
    //
    // ...
    //
}
```

首先，先更新 `trace` 裡的路線前後車站資訊：
```javascript
trace.sta.prev = trace.sta.curr;
trace.sta.curr = trace.sta.next;
trace.sta.next = undefined;
```

然後將目前確認會經過的車站 `trace.sta.curr` 存入車次的經過車站列表中，此處為了避免陷入路線尋找無限迴圈的困境，設定了 500 個車站的警告上限（車站列表中只有 241 站）：
```javascript
train.passStations.push(trace.sta.curr);
if(train.passStations.length > 500) {
    console.error("Too many stations traced:", train, trace);
    break;
}
```

接下來進行成追線的特別處理，成追線的順逆行方向定義在由海線、成追線、山線所串聯成的半環行路線上，所以要在此進行判斷與特殊處理：
```javascript
// 成追線特別處理：成追線列車之順逆行定義特殊，在此需於追分站轉換順逆行方向
if(train.tripLine === TripLines.CZ &&
   trace.sta.curr.id === "2260" /* 追分 */)
    [, trace.dir] = Directions.pair(trace.dir);
```

然後根據順逆行方向獲取可能的鄰近車站拓樸連結：
```javascript
const secs = trace.sta.curr.sections.filter(sec =>
    sec.dir === trace.dir && sec.toStation !== trace.sta.prev
);
```

從可能的鄰近車站拓樸連結中選擇合適的連結行進：
```javascript
if(secs.length === 1) trace.sta.next = secs[0].toStation;
else {
    // 若無符合支線，則優先行主幹線，再尋找其他支線
    let sec = secs.find(sec => train.branches.includes(sec.line.id));
    if(sec === undefined) sec = secs.find(sec => !sec.line.isBranch);
    if(sec === undefined) sec = secs.find(sec =>  sec.line.isBranch);

    trace.sta.next = sec.toStation;
}
```

最後在確認是否有確實找到下一個車站，如果有的話就開始下一次追蹤巡徑：
```javascript
if(trace.sta.next === undefined) {
    console.error("Next station not found:", train, trace);
    break;
}
```

### `countTrainStations(...)`

此方法的主要功能為計算所有車站被所有車次停靠經過的次數，利用剛才在 `findPassedStations(...)` 中找出來的所有經過車站來計數：
```javascript
for(const train of trains.values()) {
    for(const stopSta of train.stopStations) stopSta.stopCount++;
    for(const passSta of train.passStations) passSta.passCount++;
}
```

### `prepareBarChartData(...)`

此方法的主要功能為將資料轉換成繪製長條圖所需要使用的資料內容與格式。

首先從車站資料裡擷取車站名稱、車站等級、由計算完停靠數和經過數來計算對於所有車次的停靠經過比例值：
```javascript
const stationCounts = Array.from(
    stations.values(),
    sta => ({
        name: sta.name,
        staClass: sta.staClass,
        stopPassRatio: sta.stopCount / sta.passCount
    })
);
```

然後依據其停靠經過比例值，由大到小排序：
```javascript
stationCounts.sort(
    (a, b) => b.stopPassRatio - a.stopPassRatio
);
```

### `setupCanvas(...)`

此方法的主要功能為利用 D3 依據計算分析完的資料來繪製長條圖。

此方法內容與上課時的課程範例大致相似，以下進行快速簡介瀏覽。

首先先定義及計算圖表大小：
```javascript
const svg_width  =  800;
const svg_height = 3300;
const chart_margin = {top: 120, right: 40, bottom: 40, left: 80};
const chart_width  = svg_width  - (chart_margin.left + chart_margin.right );
const chart_height = svg_height - (chart_margin.top  + chart_margin.bottom);
```

建立 SVG：
```javascript
const this_svg = d3.select(".bar-chart-container")
    .append("svg")
    .attr("width", svg_width).attr("height", svg_height)
    .append("g")
    .attr("transform", `translate(${chart_margin.left}, ${chart_margin.top})`);
```

生成長條：
```javascript
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
```

繪製圖表標題：
```javascript
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
```

最後產生縱軸橫軸的標線與標籤：
```javascript
const xAxis = d3.axisTop(xScale)
    .tickSizeInner(-chart_height).tickSizeOuter(0);
const xAxisDraw = this_svg
    .append("g").attr("class", "x axis").call(xAxis);
const yAxis = d3.axisLeft(yScale).tickSize(0);
const yAxisDraw = this_svg
    .append("g").attr("class", "y axis").call(yAxis);
yAxisDraw.selectAll("text").attr("dx", "-0.6em");
```

### `ready(...)`

此方法的主要功能為將讀取且分析好的資料進行處理主邏輯，然後產生最終的長條圖結果：
```javascript
findPassedStations({stations, lines, trains});
const stationCounts = prepareBarChartData({stations});
setupCanvas(stationCounts);
```

### 主程式進入點

在此全域中的程式進入點進行讀取資料、分析資料的工作，然後呼叫 `ready(...)` 方法開始相關資料分析的主邏輯：
```javascript
loadRawData().then(
    rawData => {
        ready(parseRawData(rawData));
    }
);
```

## 跟目前上課內容的相關性

本專案的目標之一就是盡力模仿並學習上課時使用的課程範例，除了盡量符合期中報告的要求之外，也可以當成是一種複習。

其主要程式的部分，繪製長條圖的程式主要是由上課時使用的課程範例修改而來，而野因此長條圖的設計也相當相似。

不過在資料處理的方面就與上課時使用的課程範例有比較大的差距，可能因為我選擇的資料格式較為複雜，以及增加了更多額外的資料分析與規則演算，而非單純的資料列加減或分類聚合運算。

當然在課程當相當重要的資料分類與聚合處理動作在本專案中也當然有大量更多更複雜使用，程式中幾乎主要都是在處理與解決這部分的問題。但也因為其複雜性，所以較沒辦法利用課堂中類似的範例格式或者是簡單的幾個 D3 方法可以解決的。

## 圖表結果說明

### 圖表結果

以下為實際在這個網頁上計算產生出來的長條圖圖表，計算生成過程中的資訊可以直接開起此網頁的開發人員工具查看：

<div class="bar-chart-container" style="height: 3300px;"></div>

使用臺鐵公開資料，進行分析計算，然後輸出以「臺鐵車站站別」作為分類（縱軸），以「其車站對於所有列車之停靠經過比例值」作為其圖示長度（橫軸）之簡易長條圖。

其中，特別將長條的顏色設定為其車站的站等，越粉紅車站等級越高，越黃藍車站等級越低。

## 有何新發現

先讓我們來觀察列車停靠經過比最高（接近 1.0）的幾個車站，經觀察後發現大部分車站可以分為以下幾種：
1. 車站等級高（粉紅色、紅色）：是地區中的相當重要的車站[^tra_station_class]。
2. 支線轉乘車站：臺鐵的支線轉乘站，而且轉乘站的停靠比率通常較高。
3. 小型支線車站：因為小型支線禿常只會行駛區間車，而區間車又是幾乎每站必停，所以停靠率相當高。

再來看看列車停靠經過比最低（接近 0.0）的幾個車站，會先發現有三個車站的停靠率居然為 0.0：
1. 「臺北-環島」站：此為特定作為臺鐵環島列車的終點站，其實際為「臺北」站，而系統內部將其分出來的虛擬車站。因為此車次班表目前沒有任何臺鐵環島列車，因此停靠率為零[^tra_circular]。
2. 「枋野」站：此為南迴線上的車站，目前主要業務為管理號誌，不辦理客運業務，因此停靠率為零[^tra_station_fangye]。
3. 「新馬」站：此為宜蘭線上的車站，在 2018 年後的普悠瑪事故後決定進行此區鐵道截彎取直工程，暫停客運業務，因此停靠率為零[^tra_station_xinma]。

其他的車站大多也都符合，客流量高停靠率就越高的規則，較符合我對於此圖表的預期。

## 還可能可以觀察什麼

在資料中有更多資訊可以做比較資料項目與維度，例如路線資訊、站等資訊、車種資訊等等。如果往後可以加以互相交叉比較，想必是可以更加有趣。


<!-- Links -->

[ptx]: https://ptx.transportdata.tw/ "公共運輸整合資訊流通服務平臺"

[tdx]: https://tdx.transportdata.tw/ "運輸資料流通服務平臺"

[tdx_api_swagger]: https://tdx.transportdata.tw/api-service/swagger "線上API說明 | TDX 運輸資料流通服務"

[diagram_wiki]: https://ja.wikipedia.org/wiki/%E3%83%80%E3%82%A4%E3%83%A4%E3%82%B0%E3%83%A9%E3%83%A0 "ダイヤグラム - Wikipedia（目前沒有找到中文或英文版）"

[oudia]: http://take-okm.a.la9.jp/oudia/index.html "OuDia のホームページ"

[oudia2]: http://oudiasecond.seesaa.net/ "OuDiaSecond"

[clouddia]: http://onemu.starfree.jp/clouddia/ "CloudDia - ダイヤグラム編集"

[tradiagram]: https://tradiagram.com/ "台灣鐵路運行圖"

[tradiagram_branches]: https://github.com/billy1125/TRA_time_space_diagram/blob/master/data_process.py#L59


<!-- Footnotes -->

[^ptx_down]: [【系統公告】PTX平臺於111年12月1日起正式落日](https://ptx.transportdata.tw/PTX/Announcement/Details/ce1d655e-e5a7-45dd-bf70-3e088606aab4)，公共運輸整合資訊流通服務平臺

[^ptx_dataset_monitor]: [資料來源監控 - 公共運輸整合資訊流通服務平台](https://ptx.transportdata.tw/PTX/Monitor/etl)，公共運輸整合資訊流通服務平臺

[^tdx_api_swagger]: [線上API說明 | TDX 運輸資料流通服務][tdx_api_swagger]，運輸資料流通服務平臺

[^data_viz_bar_chart]: [D3.js – Bar Chart – 行動開發學院](https://mobiledev.tw/d3-js-bar-chart/)，行動開發學院

[^diagram_desc]: [ダイヤグラム - Wikipedia][diagram_wiki]，Wikipedia：*「公共交通工具中的「運行圖」就是一種時間距離線圖（Time–distance diagram），是表示列車、巴士、飛機等班次的運行、航行計畫的線圖。使列車等所需時間、停留時間和錯誤一目了然。」*

[^data_viz_mid_report]: [資料視覺化期中報告要求](https://hospitable-top-f1b.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F20a99178-1128-469c-8912-eba69e6aac64%2FD3js-1112-MidTerm.png?id=5a79d83d-172e-416a-9801-f5d266a0dea5&table=block&spaceId=1aef2f48-d0fe-4378-9798-ba578f17fb80&width=600&userId=&cache=v2)，111-2 Data Viz - NCU 資料視覺化

[^tra_station_class]: [臺灣鐵路管理局車站等級 - 維基百科，自由的百科全書](https://zh.wikipedia.org/zh-tw/%E8%87%BA%E7%81%A3%E9%90%B5%E8%B7%AF%E7%AE%A1%E7%90%86%E5%B1%80%E8%BB%8A%E7%AB%99%E7%AD%89%E7%B4%9A)，維基百科，自由的百科全書

[^tra_circular]: [台鐵觀光列車 - 維基百科，自由的百科全書](https://zh.wikipedia.org/zh-tw/%E5%8F%B0%E9%90%B5%E8%A7%80%E5%85%89%E5%88%97%E8%BB%8A)，維基百科，自由的百科全書

[^tra_station_fangye]: [枋野車站 - 維基百科，自由的百科全書](https://zh.wikipedia.org/zh-tw/%E6%9E%8B%E9%87%8E%E8%BB%8A%E7%AB%99)，維基百科，自由的百科全書

[^tra_station_xinma]: [新馬車站 - 維基百科，自由的百科全書](https://zh.wikipedia.org/zh-tw/%E6%96%B0%E9%A6%AC%E8%BB%8A%E7%AB%99)，維基百科，自由的百科全書
