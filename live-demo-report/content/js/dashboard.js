/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 88.75, "KoPercent": 11.25};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "POST Register"], "isController": false}, {"data": [0.775, 500, 1500, "GET Single User"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 400, 45, 11.25, 495.40500000000014, 118, 2680, 417.0, 1093.6000000000013, 2202.8499999999976, 2556.9700000000003, 39.908211114436796, 40.64509051057568, 5.845929362466328], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST Register", 200, 0, 0.0, 427.5700000000002, 401, 462, 427.0, 445.0, 451.9, 460.98, 27.75464890369137, 24.478841416874825, 5.5292464612822645], "isController": false}, {"data": ["GET Single User", 200, 45, 22.5, 563.2399999999998, 118, 2680, 172.0, 2192.700000000001, 2515.2999999999997, 2574.94, 20.86158339417962, 24.094212051475957, 1.9557734432043392], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,480 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,483 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, 4.444444444444445, 0.5], "isController": false}, {"data": ["The operation lasted too long: It took 2,569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,466 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 943 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,773 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,548 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,747 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,005 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,702 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,445 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 871 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,213 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,537 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,063 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,039 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,672 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,473 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,566 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,829 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,097 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,465 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,415 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,995 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,554 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,536 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,551 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,575 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,680 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,557 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,363 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 926 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,947 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,830 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,275 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,311 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,010 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,120 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,236 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,594 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,517 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,220 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 1,107 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,289 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 2.2222222222222223, 0.25], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 400, 45, "The operation lasted too long: It took 2,483 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 2,480 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 2,569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,466 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 943 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET Single User", 200, 45, "The operation lasted too long: It took 2,483 milliseconds, but should not have lasted longer than 500 milliseconds.", 2, "The operation lasted too long: It took 2,480 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 2,569 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 1,466 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 943 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
