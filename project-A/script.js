//registering components
Vue.component('performance-graph', {
  props: ['stats', 'index', 'type'],
  template: '<div><canvas :id="\'chart-\'+type+index"></canvas></div>',
  ready: function() {
    this.loadGraph(this.stats, this.index, this.type);
  },
  methods: {
    loadGraph: function(stats, id, type) {
      var dataSet = [stats.WonCount, stats.ForfeitedWonCount, stats.TieCount, stats.LostCount, stats.ForfeitedLostCount];
      var config = {
        type: 'HorizontalBar',
        data: {
          labels: ["Wins", "Forfeited Wins", "Ties", "Losses", "Forfeited Losses"],
          datasets: [{
            label: "",
            backgroundColor: ["rgba(115,187,0,0.8)", "rgba(115,187,0,0.8)", "rgba(115,187,0,0.8)", "rgba(154,58,34,0.8)", "rgba(154,58,34,0.8)"],
            hoverBackgroundColor: ["rgba(115,207,0,1)", "rgba(115,207,0,1)", "rgba(115,187,0,1)", "rgba(184,58,34,1)", "rgba(184,58,34,1)"],

            data: dataSet,
          }]
        },
        options: {
          tooltips: {
            callbacks: {
              title: function(tooltipItem, data) {
                console.log(tooltipItem)
                return '';
              },
              label: function(tooltipItem, data) {
                return tooltipItem.xLabel + ' ' + tooltipItem.yLabel;
              }
            }
          },
          scales: {
            yAxes: [{
              gridLines: {
                display: false
              }
            }]
          }
        }
      };
      var ctx = document.getElementById('chart-' + type + id).getContext("2d");
      new Chart(ctx, config);
    }
  }
})

//initializing Vue instance
var vm = new Vue({
  el: '#app',
  data: {
    view: 'statistics',
    id: '',
    userName: '',
    firstName: '',
    memberSince: '',
    isOnline: '',
    lastOnline: '',
    profile: '',
    avatar: '',
    stats: '',
    games: '',
    teams: ''
  },
  methods: {
    loadPlayer: function(player) {
      $.ajax({
        url: 'https://client.arena.razerzone.com/API/Player/' + player + '/',
        method: 'GET',
        context: this
      }).done(function(data) {
        $('body').scrollTop(0);
        d = new Date(Date.parse(data.Response.CreatedDateTime));
        console.log(data.Response)
        vm.view = 'statistics';
        vm.id = data.Response.EnityId;
        vm.userName = data.Response.DisplayName;
        vm.firstName = data.Response.FirstName;
        vm.memberSince = d.toLocaleDateString();
        vm.avatar = data.Response.LogoUrl;
        vm.isOnline = data.Response.IsOnline;
        vm.stats = data.Response.Statistics;
        vm.profile = data.Response.Profile;
        vm.lastOnline = data.Response.LastActivityDateTime;
        vm.teams = data.Response.Teams;
        vm.games = this.includeWinner(data.Response.Games, data.Response.EntityId, data.Response.Teams);
        $('.button--active').removeClass('button--active');
        $('.menu__button:first-child').addClass('button--active');
        document.getElementById('window').style.display = 'flex';

      });
    },
    includeWinner: function(games, id, teams) {
      for (var i = 0; i < games.length; i++) {
        for (var j = 0; j < games[i].Matches.length; j++) {
          games[i].Matches[j].WinStatus = 0;
          if (games[i].Matches[j].EntityParticipantA.Score > games[i].Matches[j].EntityParticipantB.Score) {
            teams.forEach(function(x) {
              if (x.EntityId === games[i].Matches[j].EntityParticipantA.Id) {
                games[i].Matches[j].WinStatus = 1;
              }
            })
            if (id === games[i].Matches[j].EntityParticipantA.Id) {
              games[i].Matches[j].WinStatus = 1;
            }
          } else if (games[i].Matches[j].EntityParticipantA.Score < games[i].Matches[j].EntityParticipantB.Score) {
            teams.forEach(function(x) {
              if (x.EntityId === games[i].Matches[j].EntityParticipantB.Id) {
                games[i].Matches[j].WinStatus = 1;
              }
            })
            if (id === games[i].Matches[j].EntityParticipantB.Id) {
              games[i].Matches[j].WinStatus = 1;
            }
          } else if (games[i].Matches[j].EntityParticipantA.Score === games[i].Matches[j].EntityParticipantB.Score) {
            games[i].Matches[j].WinStatus = 2;
          }

        }
      }
      return games;
    }

  },
  ready: function() {
    this.loadPlayer('travis.howle');

  }
})

//filter to identify invalid user images (null,undefined) and return a placeholder instead
Vue.filter('validateImage', function(src) {
  if (src === undefined) return src;
  if (src.backgroundImage === 'url(null)' || src === 'url(undefined)') {
    src.backgroundImage = "url(https://d8wjjpr0e320t.cloudfront.net/projects/arena/ui/default_profile_photo.png";
  }
  return src;
})

//filter to calculate the time since last activity and return a response string
Vue.filter('friendlyTime', function(time) {
  var d = new Date;
  var remaining;
  var totalElapsed = (Date.parse(d) - Date.parse(time)) / 1000;
  var secondsElapsed = totalElapsed % 60;
  var totalMinutes = Math.floor(totalElapsed / 60);
  var minutesElapsed = totalMinutes % 60;
  var totalHours = Math.floor(totalMinutes / 60);
  var hoursElapsed = totalHours % 24;
  var totalDays = Math.floor(totalHours / 24);
  var daysElapsed = totalDays % 24;
  if (totalDays > 31) {
    d = new Date(Date.parse(time));
    return d.toLocaleDateString();
  } else if (daysElapsed > 1) {
    return totalDays + " days ago.";
  } else if (daysElapsed === 1) {
    return daysElapsed + " day ago.";
  } else if (hoursElapsed > 1) {
    return hoursElapsed + " hours ago.";
  } else if (hoursElapsed === 1) {
    return "1 hour ago."
  } else if (minutesElapsed > 1) {
    return minutesElapsed + " minutes ago.";
  } else if (minutesElapsed = 1) {
    return "1 minute ago.";
  } else {
    return "a few seconds ago."
  }
});
//filter to check for empty team descriptions and return placeholder
Vue.filter('includeTeamPlaceholder', function(val) {
    if (val === null || val === undefined || val === '') return "Just another Razer Arena team.";
    else return val;
  })
  //event listener for menu buttons
$('.menu__button').on('click', function() {
  $('.button--active').removeClass('button--active');
  $(this).toggleClass('button--active');
  vm.view = $(this).html().toLowerCase();
})

//default chartjs settings, adding vertical barchart options
Chart.defaults.global.legend = false;
Chart.defaults.global.defaultFontColor = "#333";
Chart.defaults.global.defaultFontSize = 14;
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.tooltips.tooltipTemplate = "<%= value %>",
  Chart.defaults.HorizontalBar = {
    hover: {
      mode: "single"
    },
    scales: {
      yAxes: [{
        position: 'left',
        type: "category",
        categoryPercentage: 0.8,
        barPercentage: 1,
        gridLines: {
          offsetGridLines: true
        }
      }],
      xAxes: [{
        ticks: {
          beginAtZero: true
        },
        position: 'bottom',
        type: "linear",
      }],
    },
  };

Chart.controllers.HorizontalBar = Chart.controllers.bar.extend({
  updateElement: function updateElement(rectangle, index, reset, numBars) {

    var xScale = this.getScaleForId(this.getDataset().xAxisID);
    var yScale = this.getScaleForId(this.getDataset().yAxisID);

    var xScalePoint;

    if (xScale.min < 0 && xScale.max < 0) {
      xScalePoint = xScale.getPixelForValue(xScale.max);
    } else if (xScale.min > 0 && xScale.max > 0) {
      xScalePoint = xScale.getPixelForValue(xScale.min);
    } else {
      xScalePoint = xScale.getPixelForValue(0);
    }

    Chart.helpers.extend(rectangle, {
      _chart: this.chart.chart,
      _xScale: xScale,
      _yScale: yScale,
      _datasetIndex: this.index,
      _index: index,

      _model: {
        x: reset ? xScalePoint : this.calculateBarX(index, this.index),
        y: this.calculateBarY(index, this.index),
        label: this.chart.data.labels[index],
        datasetLabel: this.getDataset().label,
        base: this.calculateBarBase(this.index, index),
        height: this.calculateBarHeight(numBars),
        backgroundColor: rectangle.custom && rectangle.custom.backgroundColor ? rectangle.custom.backgroundColor : Chart.helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.rectangle.backgroundColor),
        borderColor: rectangle.custom && rectangle.custom.borderColor ? rectangle.custom.borderColor : Chart.helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.rectangle.borderColor),
        borderWidth: rectangle.custom && rectangle.custom.borderWidth ? rectangle.custom.borderWidth : Chart.helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.rectangle.borderWidth),
      },

      draw: function() {
        var ctx = this._chart.ctx;
        ctx.fillStyle = this._view.backgroundColor;
        ctx.fillRect(this._view.base, this._view.y - this._view.height / 2, this._view.x - this._view.base, this._view.height);

        ctx.strokeStyle = this._view.borderColor;
        ctx.strokeWidth = this._view.borderWidth;
        ctx.strokeRect(this._view.base, this._view.y - this._view.height / 2, this._view.x - this._view.base, this._view.height);
      },

      // override the inRange function because the one in the library needs width (we have only height)
      inRange: function(mouseX, mouseY) {
        var vm = this._view;
        var inRange = false;

        if (vm) {
          if (vm.x < vm.base) {
            inRange = (mouseY >= vm.y - vm.height / 2 && mouseY <= vm.y + vm.height / 2) && (mouseX >= vm.x && mouseX <= vm.base);
          } else {
            inRange = (mouseY >= vm.y - vm.height / 2 && mouseY <= vm.y + vm.height / 2) && (mouseX >= vm.base && mouseX <= vm.x);
          }
        }

        return inRange;
      }
    });

    rectangle.pivot();

    // the animation progresses _view values from their current value to the _model value
    rectangle._view.x = rectangle._model.base;
  },

  calculateBarBase: function(datasetIndex, index) {
    var xScale = this.getScaleForId(this.getDataset().xAxisID);
    var yScale = this.getScaleForId(this.getDataset().yAxisID);

    var base = 0;

    if (xScale.options.stacked) {
      var value = this.chart.data.datasets[datasetIndex].data[index];

      if (value < 0) {
        for (var i = 0; i < datasetIndex; i++) {
          var negDS = this.chart.data.datasets[i];
          if (Chart.helpers.isDatasetVisible(negDS) && negDS.xAxisID === xScale.id) {
            base += negDS.data[index] < 0 ? negDS.data[index] : 0;
          }
        }
      } else {
        for (var j = 0; j < datasetIndex; j++) {
          var posDS = this.chart.data.datasets[j];
          if (Chart.helpers.isDatasetVisible(posDS) && posDS.xAxisID === xScale.id) {
            base += posDS.data[index] > 0 ? posDS.data[index] : 0;
          }
        }
      }

      return xScale.getPixelForValue(base);
    }

    base = xScale.getPixelForValue(xScale.min);

    if (xScale.beginAtZero || ((xScale.min <= 0 && xScale.max >= 0) || (xScale.min >= 0 && xScale.max <= 0))) {
      base = xScale.getPixelForValue(0, 0);
    } else if (xScale.min < 0 && xScale.max < 0) {
      base = xScale.getPixelForValue(xScale.max);
    }

    return base;
  },

  getRuler: function() {
    var xScale = this.getScaleForId(this.getDataset().xAxisID);
    var yScale = this.getScaleForId(this.getDataset().yAxisID);
    var datasetCount = this.getBarCount();

    var tickHeight = (function() {
      var min = yScale.getPixelForTick(1) - yScale.getPixelForTick(0);
      for (var i = 2; i < this.getDataset().data.length; i++) {
        min = Math.min(yScale.getPixelForTick(i) - yScale.getPixelForTick(i - 1), min);
      }
      return min;
    }).call(this);
    var categoryHeight = tickHeight * yScale.options.categoryPercentage;
    var categorySpacing = (tickHeight - (tickHeight * yScale.options.categoryPercentage)) / 2;
    var fullBarHeight = categoryHeight / datasetCount;
    var barHeight = fullBarHeight * yScale.options.barPercentage;
    var barSpacing = fullBarHeight - (fullBarHeight * yScale.options.barPercentage);

    return {
      datasetCount: datasetCount,
      tickHeight: tickHeight,
      categoryHeight: categoryHeight,
      categorySpacing: categorySpacing,
      fullBarHeight: fullBarHeight,
      barHeight: barHeight,
      barSpacing: barSpacing,
    };
  },

  calculateBarHeight: function() {
    var yScale = this.getScaleForId(this.getDataset().yAxisID);
    var ruler = this.getRuler();

    if (yScale.options.stacked) {
      return ruler.categoryHeight;
    }

    return ruler.barHeight;
  },

  calculateBarY: function(index, datasetIndex) {
    var yScale = this.getScaleForId(this.getDataset().yAxisID);
    var xScale = this.getScaleForId(this.getDataset().xAxisID);
    var barIndex = this.getBarIndex(datasetIndex);

    var ruler = this.getRuler();
    var leftTick = yScale.getPixelForValue(null, index, datasetIndex, this.chart.isCombo);
    leftTick -= this.chart.isCombo ? (ruler.tickHeight / 2) : 0;

    if (yScale.options.stacked) {
      return leftTick + (ruler.categoryHeight / 2) + ruler.categorySpacing;
    }

    return leftTick +
      (ruler.barHeight / 2) +
      ruler.categorySpacing +
      (ruler.barHeight * barIndex) +
      (ruler.barSpacing / 2) +
      (ruler.barSpacing * barIndex);
  },

  calculateBarX: function(index, datasetIndex) {
    var xScale = this.getScaleForId(this.getDataset().xAxisID);
    var yScale = this.getScaleForId(this.getDataset().yAxisID);

    var value = this.getDataset().data[index];

    if (xScale.options.stacked) {
      var sumPos = 0,
        sumNeg = 0;

      for (var i = 0; i < datasetIndex; i++) {
        var ds = this.chart.data.datasets[i];
        if (Chart.helpers.isDatasetVisible(ds)) {
          if (ds.data[index] < 0) {
            sumNeg += ds.data[index] || 0;
          } else {
            sumPos += ds.data[index] || 0;
          }
        }
      }

      if (value < 0) {
        return xScale.getPixelForValue(sumNeg + value);
      } else {
        return xScale.getPixelForValue(sumPos + value);
      }

      return xScale.getPixelForValue(value);
    }

    return xScale.getPixelForValue(value);
  }
});
