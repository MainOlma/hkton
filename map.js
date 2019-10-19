import * as d3 from 'd3'
import gridMap from './gridmap.csv'

function drawMap() {
    const w = 572, h = 442
//scales
    const rowscale = d3.scaleLinear()
        .domain([0, 26])
        .range([0, h])

    const colscale = d3.scaleLinear()
        .domain([0, 22])
        .range([0, w])

    const circleScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0, colscale(1)])

    const wghtScale = d3.scaleLinear()
        .domain([20, 80])
        .range([30, 800])

    const wdthScale = d3.scaleLinear()
        .domain([0, 100])
        .range([50, 200])

    let focus;

    function drawCountryes(countryData) {

        //Set up SVG
        const svg = d3.select("#root").append("svg").classed("chart",true)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "black");


        const header = svg.append("g").classed("header",true)

        header.append("text")
            .classed("main",true)
            .html("Избыточный вес в <tspan class='year'>2016</tspan> году")
            .attr("x", 24)
            .attr("y", 25)

        const legend = header.append("text")
            .classed("legend",true)
            .attr("x", 25)
            .attr("y", 57)

        legend.append("tspan")
            .attr("dy",0)
            .attr("x",24)
            .text("Жирность шрифта показывает процент населения")
        legend.append("tspan")
            .attr("dy","14")
            .attr("x",24)
            .text("с избыточным весом:")

        const note = header.append("text")
            .classed("note",true)
            .attr("x", 377)
            .attr("y", 56)

        note.append("tspan")
            .attr("dy",0)
            .attr("x",377)
            .text("Данные нормированы")
        note.append("tspan")
            .attr("dy","14")
            .attr("x",377)
            .text("по возрасту")

        const percents = header.append("text")
            .classed("percents",true)
            .attr("x", 25)
            .attr("y", 92)

        percents.append("tspan")
            .text("20% ")
            .style("font-variation-settings",`'wght' ${wghtScale(20)}, 'wdth' 50`)

        percents.append("tspan")
            .text("30% ")
            .style("font-variation-settings",`'wght' ${wghtScale(30)}, 'wdth' 50`)

        percents.append("tspan")
            .text("40% ")
            .style("font-variation-settings",`'wght' ${wghtScale(40)}, 'wdth' 50`)

        percents.append("tspan")
            .text("50% ")
            .style("font-variation-settings",`'wght' ${wghtScale(50)}, 'wdth' 50`)

        percents.append("tspan")
            .text("60% ")
            .style("font-variation-settings",`'wght' ${wghtScale(60)}, 'wdth' 50`)

        percents.append("tspan")
            .text("70% ")
            .style("font-variation-settings",`'wght' ${wghtScale(70)}, 'wdth' 50`)

        percents.append("tspan")
            .text("80%")
            .style("font-variation-settings",`'wght' ${wghtScale(80)}, 'wdth' 50`)







// COUNTRY label boxes
        const labelboxes = svg.selectAll("rect.boxes").data(countryData).enter().append("rect")
            .attr("fill", "rgba(0,0,0,0)")
            .attr("class", "boxes")
            .attr("width", colscale(1))
            .attr("height", rowscale(1))
            .attr("x", d => {
                return colscale(d.Col - 1);
            })
            .attr("y", d => {
                return rowscale(d.Row - 1)+183;
            });

        // COUNTRY Labels
        const labels = svg.selectAll("text.label")
            .data(countryData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("font-size", 16)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("x", d => {
                if (d) return colscale(+d.Col - 0.5)
            })
            .attr("y", d => {
                if (d) return rowscale(+d.Row - 0.35)+183;
            })
            .text(d => d.CountryCode)
            .style("font-variation-settings", d => `"wght" ${wghtScale(d['2016sexes'])}, "wdth" ${wdthScale(d['2016sexes'])}`)
            .style("pointer-events", "none");

        labelboxes.on("mouseover", function (d) {
            focus = d.CountryCode
            // get THIS box's x and y values
            var xPos = parseFloat(d3.select(this).attr("x")) + 20;
            var yPos = parseFloat(d3.select(this).attr("y")) + 20;
            //console.log(yPos)
            // update tooltip
            d3.select("#tooltip")
                .style("left", xPos + "px")
                .style("top", yPos + "px")
            d3.select("#tooltip .name").text(d.ShortName)
            d3.select("#tooltip #value").text(d3.format(",.2f")(Math.abs(+d['2016sexes']))+"%")
            d3.select("#tooltip .year").text(" в 2000");

            d3.select("#tooltip").classed("hidden", false);
        });
        labelboxes.on("mouseout", function () {
            d3.select(this).style("fill", "rgba(0,0,0,0)");
            d3.select("#tooltip").classed("hidden", true);
        });

    }
    let i
    const victimsData = []

    d3.csv(gridMap).then(data => {
        d3.csv(fat).then(fatData => {



            for (i = 0; i <= data.length; i++) {
                if (data[i]) {
                    const object = fatData.find(e=>e.Country==data[i].Country)
                    for (var property in object) {
                        if (object.hasOwnProperty(property)) {
                            const attrArray = property.match(/^\d+|\w+$/g),
                                year = attrArray[0],
                                sex = attrArray[1]
                            if (object)  data[i][year+sex]=+object[property].match(/\d+.\d+/)
                            else {
                                data[i].value=0
                                data[i].nodata=true
                            }
                        }
                    }

                    victimsData.push(data[i])

                }
            }

            //console.log(victimsData)
            drawCountryes(victimsData)

            let ix = 1976
            const delay=1000
            let timer
            resetTimer()

            function resetTimer(){
                timer =setInterval(timerTick, delay);
            }

            const playButton = d3.select("svg").append("text").attr("class","playbutton").text("❚❚")
                .attr("x",w-rowscale(0.9))
                .attr("y",colscale(0.75))
                .attr("fill","rgba(0,0,0,0)")
                .style("cursor","pointer");

            function timerTick() {

                const check=checkButton()

                if (check=="stop") {
                    clearInterval(timer);
                }
                if (ix <= 2016 && check=="resume"){
                    updateData(ix)
                    ix++
                }
                if (ix > 2016 && check=="resume") {
                    ix = 1976
                    //timer.stop()
                    clearInterval(timer);
                    resetTimer()
                }
                if (ix >= 2016 && check=="stop") {
                    ix = 1976
                    clearInterval(timer);
                }
            }

            function checkButton(){

                playButton
                    .on("click", function() {
                        const button = d3.select(this)

                        if (button.text() === "▶") {
                            //if (ix==0) {ix=0; timer.stop()}
                            if (ix > 2016) {
                                ix = 0
                                clearInterval(timer);
                                resetTimer()
                            }
                            else resetTimer();

                            button.text("❚❚")
                                .classed("paused",false);

                        } else {

                            clearInterval(timer);
                            button
                                .text("▶")
                                .classed("paused",true);
                        }
                    })
                let result = (playButton.text()=="▶") ? "stop" : "resume"
                return result
            }

            function updateData(year) {

                d3.select("tspan.year").text(year)
                const countryData = victimsData
                //console.log ("update data",year)


                const labels = d3.select("svg").selectAll("text.label")
                    .data(countryData)

                labels
                    .classed("withoutData", d => {
                        if (!d.hasOwnProperty(year+"sexes")) return true
                        else return false
                    })

                    //.style("font-variation-settings", d => `"wght" ${wghtScale(d['2016sexes'])}, "wdth" ${wdthScale(d['2016sexes'])}`)

                    .style("font-variation-settings",(d) => {
                        if (!focus) focus = "RUS"
                        let elem = countryData.find(el => el.CountryCode == focus)

                        d3.select("#tooltip #value")
                            .text(d3.format(",.4f")(+elem[year+"sexes"]) + "%")

                        d3.select("#tooltip .year").text(" в " + year);

                        return `'wght' ${wghtScale(d[year+'sexes'])}, 'wdth' 50`
                    })



            }



        })
    })

    }
