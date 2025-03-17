// 格式化数字为带千位分隔符的字符串
function formatNumber(num) {
    return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

// 格式化百分比
function formatPercent(num) {
    return (num > 0 ? '+' : '') + num.toFixed(2) + '%';
}

// 初始化小时成交额图表
function initHourlyChart() {
    const chartDom = document.getElementById('hourly-chart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const time = params[0].name;
                let html = `<div style="font-weight:bold;margin-bottom:5px;">${time}</div>`;
                
                params.forEach(param => {
                    const color = param.color;
                    const marker = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>`;
                    const seriesName = param.seriesName;
                    const value = formatNumber(param.value) + '亿元';
                    html += `<div>${marker}${seriesName}: ${value}</div>`;
                });
                
                return html;
            }
        },
        legend: {
            data: ['今日成交额', '昨日成交额'],
            right: '10%',
            textStyle: {
                color: '#666'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [],
            axisLine: {
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                color: '#666'
            }
        },
        yAxis: {
            type: 'value',
            name: '成交额(亿元)',
            nameTextStyle: {
                color: '#666'
            },
            axisLine: {
                show: false
            },
            axisLabel: {
                color: '#666',
                formatter: function(value) {
                    if (value >= 10000) {
                        return (value / 10000).toFixed(1) + '万亿';
                    }
                    return value;
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#eee'
                }
            }
        },
        series: [
            {
                name: '今日成交额',
                type: 'line',
                data: [],
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#409eff'
                },
                lineStyle: {
                    width: 3
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                        { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
                    ])
                }
            },
            {
                name: '昨日成交额',
                type: 'line',
                data: [],
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#e6a23c'
                },
                lineStyle: {
                    width: 3
                }
            }
        ]
    };
    
    myChart.setOption(option);
    return myChart;
}

// 初始化日成交额图表
function initDailyChart() {
    const chartDom = document.getElementById('daily-chart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const date = params[0].name;
                const value = formatNumber(params[0].value) + '亿元';
                return `<div style="font-weight:bold;margin-bottom:5px;">${date}</div><div>成交额: ${value}</div>`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: [],
            axisLine: {
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                color: '#666',
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '成交额(亿元)',
            nameTextStyle: {
                color: '#666'
            },
            axisLine: {
                show: false
            },
            axisLabel: {
                color: '#666',
                formatter: function(value) {
                    if (value >= 10000) {
                        return (value / 10000).toFixed(1) + '万亿';
                    }
                    return value;
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#eee'
                }
            }
        },
        series: [
            {
                type: 'bar',
                data: [],
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#83bff6' },
                        { offset: 0.5, color: '#188df0' },
                        { offset: 1, color: '#188df0' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#2378f7' },
                            { offset: 0.7, color: '#2378f7' },
                            { offset: 1, color: '#83bff6' }
                        ])
                    }
                }
            }
        ]
    };
    
    myChart.setOption(option);
    return myChart;
}

// 更新小时图表数据
function updateHourlyChart(chart, hourlyData, yesterdayData) {
    const hours = [];
    const todayValues = [];
    const yesterdayValues = [];
    
    // 处理今日数据
    hourlyData.forEach(item => {
        hours.push(item.hour);
        todayValues.push(item.total_volume);
    });
    
    // 处理昨日数据（如果有）
    if (yesterdayData && yesterdayData.length > 0) {
        // 确保小时数量一致
        const maxHours = Math.max(hours.length, yesterdayData.length);
        for (let i = 0; i < maxHours; i++) {
            if (i < yesterdayData.length) {
                yesterdayValues[i] = yesterdayData[i].total_volume;
            } else {
                yesterdayValues[i] = null;
            }
        }
    }
    
    chart.setOption({
        xAxis: {
            data: hours
        },
        series: [
            {
                name: '今日成交额',
                data: todayValues
            },
            {
                name: '昨日成交额',
                data: yesterdayValues
            }
        ]
    });
}

// 更新日图表数据
function updateDailyChart(chart, dailyData) {
    const dates = [];
    const values = [];
    
    dailyData.forEach(item => {
        dates.push(item.date);
        values.push(item.total_volume);
    });
    
    chart.setOption({
        xAxis: {
            data: dates
        },
        series: [
            {
                data: values
            }
        ]
    });
}

// 获取数据并更新页面
function fetchDataAndUpdateUI() {
    fetch('../static/data/current_data.json')
        .then(response => response.json())
        .then(data => {
            // 更新页面数据
            document.getElementById('last-update').textContent = '最后更新时间: ' + data.last_update;
            
            // 获取最新的小时数据
            const hourlyData = data.hourly_data;
            if (hourlyData && hourlyData.length > 0) {
                const latestData = hourlyData[hourlyData.length - 1];
                
                // 更新总成交额
                document.getElementById('total-volume').textContent = formatNumber(latestData.total_volume) + '亿元';
                
                // 更新上证指数
                document.getElementById('sh-index').textContent = latestData.sh_index.toFixed(2);
                const shChangeElem = document.getElementById('sh-change');
                shChangeElem.textContent = formatPercent(latestData.sh_change_pct);
                shChangeElem.className = 'change ' + (latestData.sh_change_pct >= 0 ? 'positive' : 'negative');
                
                // 更新深证成指
                document.getElementById('sz-index').textContent = latestData.sz_index.toFixed(2);
                const szChangeElem = document.getElementById('sz-change');
                szChangeElem.textContent = formatPercent(latestData.sz_change_pct);
                szChangeElem.className = 'change ' + (latestData.sz_change_pct >= 0 ? 'positive' : 'negative');
                
                // 计算较昨日变化
                if (data.daily_data && data.daily_data.length >= 2) {
                    const yesterdayData = data.daily_data[data.daily_data.length - 2];
                    const volumeChange = ((latestData.total_volume - yesterdayData.total_volume) / yesterdayData.total_volume * 100);
                    const volumeChangeElem = document.getElementById('volume-change');
                    volumeChangeElem.textContent = '较昨日: ' + formatPercent(volumeChange);
                    volumeChangeElem.className = 'change ' + (volumeChange >= 0 ? 'positive' : 'negative');
                }
            }
            
            // 更新图表
            const hourlyChart = initHourlyChart();
            const dailyChart = initDailyChart();
            
            // 获取昨日小时数据（这里简化处理，实际应该从后端获取）
            let yesterdayHourlyData = [];
            if (data.daily_data && data.daily_data.length >= 2) {
                // 这里假设后端提供了昨日小时数据
                // 实际项目中可能需要单独的API来获取
                yesterdayHourlyData = data.yesterday_hourly_data || [];
            }
            
            updateHourlyChart(hourlyChart, hourlyData, yesterdayHourlyData);
            updateDailyChart(dailyChart, data.daily_data);
            
            // 窗口大小变化时重绘图表
            window.addEventListener('resize', function() {
                hourlyChart.resize();
                dailyChart.resize();
            });
        })
        .catch(error => {
            console.error('获取数据失败:', error);
        });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    fetchDataAndUpdateUI();
    
    // 每分钟刷新一次数据
    setInterval(fetchDataAndUpdateUI, 60000);
}); 