"use strict";angular.module("yourfundFullstackApp",["ngCookies","ngResource","ngSanitize","btford.socket-io","ui.router","ui.bootstrap","ngTable"]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(a,b,c,d){b.otherwise("/"),c.html5Mode(!0),d.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b,c,d){return{request:function(a){return a.headers=a.headers||{},c.get("token")&&(a.headers.Authorization="Bearer "+c.get("token")),a},responseError:function(a){return 401===a.status?(d.path("/login"),c.remove("token"),b.reject(a)):b.reject(a)}}}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$stateChangeStart",function(a,d){c.isLoggedInAsync(function(a){d.authenticate&&!a&&b.path("/login")})})}]),angular.module("yourfundFullstackApp").config(["$stateProvider",function(a){a.state("login",{url:"/login",templateUrl:"app/account/login/login.html",controller:"LoginCtrl"}).state("signup",{url:"/signup",templateUrl:"app/account/signup/signup.html",controller:"SignupCtrl"}).state("settings",{url:"/settings",templateUrl:"app/account/settings/settings.html",controller:"SettingsCtrl",authenticate:!0})}]),angular.module("yourfundFullstackApp").controller("LoginCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.user.password="admin",a.user.email="admin@admin.com",a.login=function(d){a.submitted=!0,d.$valid&&b.login({email:a.user.email,password:a.user.password}).then(function(){c.path("/")})["catch"](function(b){a.errors.other=b.message})},a.loginOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("yourfundFullstackApp").controller("SettingsCtrl",["$scope","User","Auth",function(a,b,c){a.errors={},a.changePassword=function(b){a.submitted=!0,b.$valid&&c.changePassword(a.user.oldPassword,a.user.newPassword).then(function(){a.message="Password successfully changed."})["catch"](function(){b.password.$setValidity("mongoose",!1),a.errors.other="Incorrect password",a.message=""})}}]),angular.module("yourfundFullstackApp").controller("SignupCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.register=function(d){a.submitted=!0,d.$valid&&b.createUser({name:a.user.name,email:a.user.email,password:a.user.password}).then(function(){c.path("/")})["catch"](function(b){b=b.data,a.errors={},angular.forEach(b.errors,function(b,c){d[c].$setValidity("mongoose",!1),a.errors[c]=b.message})})},a.loginOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("yourfundFullstackApp").controller("AdminCtrl",["$scope","$http","Auth","User",function(a,b,c,d){a.users=d.query(),a["delete"]=function(b){d.remove({id:b._id}),angular.forEach(a.users,function(c,d){c===b&&a.users.splice(d,1)})}}]),angular.module("yourfundFullstackApp").config(["$stateProvider",function(a){a.state("admin",{url:"/admin",templateUrl:"app/admin/admin.html",controller:"AdminCtrl"})}]),angular.module("yourfundFullstackApp").controller("MyrouteCtrl",["$scope","Auth",function(a){a.message="Hello"}]),angular.module("yourfundFullstackApp").config(["$stateProvider",function(a){a.state("home",{url:"/",templateUrl:"app/home/home.html",controller:"MyrouteCtrl"})}]),angular.module("yourfundFullstackApp").controller("MainCtrl",["$scope","$modal","$http","$filter","socket","Auth","service","ngTableParams",function(a,b,c,d,e,f,g,h){function i(b){c.get("/api/funds/"+b._id).success(function(b){a.selectedFund=b,e.syncUpdates("funds",a.selectedFund),console.log(b);var c=0,d=100;b.stocks.length>0&&b.stocks.forEach(function(a){d-=a.originalPercentOfFund}),c=d,a.selectedFundName=b.name,a.totalInvested=b.goal,a.amountLeftToInvest=b.cash,a.percentLeftToInvest=c}),a.tableParams=new h({page:1,count:50,sorting:{description:"asc"}},{total:b.stocks.length,getData:function(a,c){var e=c.sorting()?d("orderBy")(b.stocks,c.orderBy()):b.stocks;a.resolve(e.slice((c.page()-1)*c.count(),c.page()*c.count()))}}),console.log("selected fund = "+JSON.stringify(b))}a.getCurrentUser=f.getCurrentUser,a.selectedFund=null,a.getCurrentUser().funds&&i(a.getCurrentUser().funds[0]),a.getSuggestedStocks=function(b){return g.getHistoricalData(b,a.startDate,a.endDate).then(function(a){var b=[];return a.ResultSet.Result.forEach(function(a){b.push(a)}),console.log(b),b})},a.setSelectedFund=function(a){i(a)},a.deleteFund=function(){a.fundToDelete=a.selectedFund;var c=b.open({templateUrl:"myModalContent.html",controller:"ModalInstanceCtrl",resolve:{fundToDelete:function(){return a.fundToDelete}}});c.result.then(function(b){a.selected=b},function(){$log.info("Modal dismissed at: "+new Date)})},a.addFund=function(){""!==a.fundName&&""!==a.initialInvestment&&(a.isBusy=!0,c.post("/api/funds",{name:a.fundName,cash:a.initialInvestment,goal:a.initialInvestment,finalized:!1,created:Date()}).then(function(b){a.isBusy=!1,a.getCurrentUser().funds=b.data.funds,i(b.data.funds[b.data.funds.length-1])},function(){a.isBusy=!1}),a.name="",a.cash="",a.goal="",a.finalized="",a.created="",a.fundName="",a.initialInvestment="")},a.setSelectedStock=function(b){a.stockSymbol=b},a.addStockToFund=function(){""!==a.stockSymbol&&""!==a.stockPercentage&&(a.isBusy=!0,c.post("/api/stocks",{symbol:a.stockSymbol,action:"Buy",originalPercentOfFund:a.stockPercentage,explanation:"",description:a.stock,active:!0,finalized:!1,created:Date(),fundId:a.selectedFund._id}).then(function(b){a.isBusy=!1,i(b.data)},function(){a.isBusy=!1}),a.stockSymbol="",a.stockPercentage="",a.stock="")},a.$on("$destroy",function(){e.unsyncUpdates("funds")})}]),angular.module("yourfundFullstackApp").controller("ModalInstanceCtrl",["$scope","$modalInstance","$http","Auth","fundToDelete",function(a,b,c,d,e){a.fundToDelete=e,a.ok=function(){c["delete"]("/api/funds/"+e._id).then(function(){a.isBusy=!1,d.updateCurrentUser(),b.dismiss("cancel")},function(){a.isBusy=!1}),a.fundToDelete.id=null},a.cancel=function(){b.dismiss("cancel")}}]),angular.module("yourfundFullstackApp").config(["$stateProvider",function(a){a.state("main",{url:"/main",templateUrl:"app/main/main.html",controller:"MainCtrl",authenticate:!0})}]),angular.module("yourfundFullstackApp").factory("Auth",["$location","$rootScope","$http","User","$cookieStore","$q",function(a,b,c,d,e,f){var g={};return e.get("token")&&(g=d.get()),{login:function(a,b){var h=b||angular.noop,i=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=d.get(),i.resolve(a),h()}).error(function(a){return this.logout(),i.reject(a),h(a)}.bind(this)),i.promise},logout:function(){e.remove("token"),g={}},createUser:function(a,b){var c=b||angular.noop;return d.save(a,function(b){return e.put("token",b.token),g=d.get(),c(a)},function(a){return this.logout(),c(a)}.bind(this)).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.changePassword({id:g._id},{oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},getCurrentUser:function(){return g},updateCurrentUser:function(){g=d.get()},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)})["catch"](function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return"admin"===g.role},getToken:function(){return e.get("token")}}}]),angular.module("yourfundFullstackApp").factory("User",["$resource",function(a){return a("/api/users/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}}})}]).factory("service",["$q","$http",function(a){return{getHistoricalData:function(b){var c=a.defer(),d=window.YAHOO={Finance:{SymbolSuggest:{}}};return $.ajax({type:"GET",dataType:"jsonp",jsonp:"callback",jsonpCallback:"YAHOO.Finance.SymbolSuggest.ssCallback",data:{query:b},cache:!0,url:"http://autoc.finance.yahoo.com/autoc"}),d.Finance.SymbolSuggest.ssCallback=function(a){c.resolve(a)},c.promise}}}]),angular.module("yourfundFullstackApp").factory("Modal",["$rootScope","$modal",function(a,b){function c(c,d){var e=a.$new();return c=c||{},d=d||"modal-default",angular.extend(e,c),b.open({templateUrl:"components/modal/modal.html",windowClass:d,scope:e})}return{confirm:{"delete":function(a){return a=a||angular.noop,function(){var b,d=Array.prototype.slice.call(arguments),e=d.shift();b=c({modal:{dismissable:!0,title:"Confirm Delete",html:"<p>Are you sure you want to delete <strong>"+e+"</strong> ?</p>",buttons:[{classes:"btn-danger",text:"Delete",click:function(a){b.close(a)}},{classes:"btn-default",text:"Cancel",click:function(a){b.dismiss(a)}}]}},"modal-danger"),b.result.then(function(b){a.apply(b,d)})}}}}}]),angular.module("yourfundFullstackApp").directive("mongooseError",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(){return d.$setValidity("mongoose",!0)})}}}),angular.module("yourfundFullstackApp").controller("NavbarCtrl",["$scope","$location","Auth",function(a,b,c){a.menu=[{title:"Home",link:"/"}],a.isCollapsed=!0,a.isLoggedIn=c.isLoggedIn,a.isAdmin=c.isAdmin,a.getCurrentUser=c.getCurrentUser,a.logout=function(){c.logout(),b.path("/login")},a.isActive=function(a){return a===b.path()}}]),angular.module("yourfundFullstackApp").factory("socket",["socketFactory",function(a){var b=io("",{path:"/socket.io-client"}),c=a({ioSocket:b});return{socket:c,syncUpdates:function(a,b,d){d=d||angular.noop,c.on(a+":save",function(a){var c=_.find(b,{_id:a._id}),e=b.indexOf(c),f="created";c?(b.splice(e,1,a),f="updated"):b.push(a),d(f,a,b)}),c.on(a+":remove",function(a){var c="deleted";_.remove(b,{_id:a._id}),d(c,a,b)})},unsyncUpdates:function(a){c.removeAllListeners(a+":save"),c.removeAllListeners(a+":remove")}}}]),angular.module("yourfundFullstackApp").run(["$templateCache",function(a){a.put("app/account/login/login.html",'<div class=container><div class=row><div class=col-sm-12><h1>Login</h1><p>Accounts are reset on server restart from <code>server/config/seed.js</code>. Default account is <code>test@test.com</code> / <code>test</code></p><p>Admin account is <code>admin@admin.com</code> / <code>admin</code></p></div><div class=col-sm-12><form class=form name=form ng-submit=login(form) novalidate><div class=form-group><label>Email</label><input type=email name=email class=form-control ng-model=user.email required></div><div class=form-group><label>Password</label><input type=password name=password class=form-control ng-model=user.password required></div><div class="form-group has-error"><p class=help-block ng-show="form.email.$error.required && form.password.$error.required && submitted">Please enter your email and password.</p><p class=help-block ng-show="form.email.$error.email && submitted">Please enter a valid email.</p><p class=help-block>{{ errors.other }}</p></div><div><button class="btn btn-inverse btn-lg btn-login" type=submit>Login</button> <a class="btn btn-default btn-lg btn-register" href=/signup>Register</a></div><hr><!--  <div>\n          <a class="btn btn-google-plus" href="" ng-click="loginOauth(\'google\')">\n            <i class="fa fa-google-plus"></i> Connect with Google+\n          </a>\n        </div>--></form></div></div><hr></div>'),a.put("app/account/settings/settings.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show="(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class="btn btn-lg btn-primary" type=submit>Save changes</button></form></div></div></div>'),a.put("app/account/signup/signup.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Sign up</h1></div><div class=col-sm-12><form class=form name=form ng-submit=register(form) novalidate><div class=form-group ng-class="{ \'has-success\': form.name.$valid && submitted,\n                                            \'has-error\': form.name.$invalid && submitted }"><label>Name</label><input name=name class=form-control ng-model=user.name required><p class=help-block ng-show="form.name.$error.required && submitted">A name is required</p></div><div class=form-group ng-class="{ \'has-success\': form.email.$valid && submitted,\n                                            \'has-error\': form.email.$invalid && submitted }"><label>Email</label><input type=email name=email class=form-control ng-model=user.email required mongoose-error><p class=help-block ng-show="form.email.$error.email && submitted">Doesn\'t look like a valid email.</p><p class=help-block ng-show="form.email.$error.required && submitted">What\'s your email address?</p><p class=help-block ng-show=form.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class="{ \'has-success\': form.password.$valid && submitted,\n                                            \'has-error\': form.password.$invalid && submitted }"><label>Password</label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show="(form.password.$error.minlength || form.password.$error.required) && submitted">Password must be at least 3 characters.</p><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.password }}</p></div><div><button class="btn btn-inverse btn-lg btn-login" type=submit>Sign up</button> <a class="btn btn-default btn-lg btn-register" href=/login>Login</a></div><hr><div><a class="btn btn-google-plus" href="" ng-click="loginOauth(\'google\')"><i class="fa fa-google-plus"></i> Connect with Google+</a></div></form></div></div><hr></div>'),a.put("app/admin/admin.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><p>The delete user and user index api routes are restricted to users with the \'admin\' role.</p><ul class=list-group><li class=list-group-item ng-repeat="user in users"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user) class=trash><span class="glyphicon glyphicon-trash pull-right"></span></a></li></ul></div>'),a.put("app/home/home.html",'<div id=page-wrapper><div class=row><div class=col-lg-12><h1 class=page-header>Welcome to Your Fund</h1></div></div><div class=row><div class=col-lg-6><div class="panel panel-green"><div class=panel-heading>Getting Started</div><div class=panel-body style=font-size:12pt><img src=../../../assets/images/93c1f138.yf.start.land.alt.png alt=image class=img-responsive><p></p><div class="well well-sm">Welcome to Your Fund, where you can gain investment knowledge and create one or more customized funds based on your goals, timeframe, and risk tolerance. Our patent-pending process enables you to invest for your future goals as well as learn about investing concepts to make you a better investor.<p></p><ul><li><b>Orientation</b>: Learn about the Your Fund process and how it can benefit your financial goals.</li><li><b>Goal setting</b>: Get help mapping how to reach your financial destinations, such as saving for a new car, vacation, college fund, or retirement.</li><li><b>Risk</b>:: Understand risk and how it can affect your investment criteria and decisions.</li></ul></div></div><div class=panel-footer></div></div></div><div class="col-lg-2 col-md-2 col-sm-3 col-xs-2"><div class=short-div><div class="panel panel-green"><div class=panel-heading>Options</div><div class=panel-body style=font-size:12pt><div class="well well-sm"><ul><li>Orientation</li><li>Risk</li><li>Goal Setting</li><li>Pricing</li><li>Help</li><li>About us</li></ul></div></div></div></div><div class=short-div><div class="panel panel-green"><div class=panel-heading>Register today</div><div class=panel-body style=font-size:12pt><div class="well well-sm">Enjoy all of the benifits that XXXX has to offer. Register today and start watching your money grow.</div></div></div></div></div></div></div>'),a.put("app/main/main.html",'<div id=page-wrapper><div class=row><div class=col-lg-12><h1 class=page-header>Manage Your Funds</h1></div></div><div class=row><div class="col-lg-2 sidebar-offcanvas" id=sidebar style=max-width:190px><ul class="list-group list-unstyled"><li><a href=# ng-repeat="fund in getCurrentUser().funds" class=list-group-item ng-click=setSelectedFund(fund) style=width:180px;active:background:#dff0d8>{{fund.name}}</a></li></ul><button type=button class="btn btn-success btn-lg" data-toggle=modal data-target=#myModal>Create New Fund</button><!-- Create Fund Modal --><div class="modal fade" id=myModal tabindex=-1 role=dialog aria-labelledby=myModalLabel aria-hidden=true><div class=modal-dialog><div class=modal-content><div class=modal-header><button type=button class=close data-dismiss=modal aria-hidden=true>&times;</button><h4 class=modal-title id=myModalLabel>Create Fund</h4></div><div class=modal-body><form role=form><div class=form-group><label>Fund Name</label><input class=form-control ng-model=fundName><p class=help-block>Enter the name of the fund.</p><label>Initial Investment</label><input class=form-control ng-model=initialInvestment><p class=help-block>Enter the initial investment amount for the fund.</p></div></form></div><div class=modal-footer><button type=button class="btn btn-default" data-dismiss=modal>Close</button> <button type=button class="btn btn-primary" ng-click=addFund() data-dismiss=modal>Save changes</button></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div></div><div class=col-lg-10><div class="panel panel-green" ng-show="selectedFundName != null "><!-- Begin: Panel Header --><div class=panel-heading><i class="fa fa-line-chart fa-fw"></i> {{selectedFundName}}<div class=pull-right><div class=btn-group><button type=button class="btn btn-xs dropdown-toggle" data-toggle=dropdown style=color:#000000>Actions <span class=caret></span></button><ul class="dropdown-menu pull-right" role=menu><li><a href=# ng-click=deleteFund(fund)>Delete</a></li></ul></div></div></div><!-- Begin: Panel Header --><div class=panel-body style=font-size:12pt><div class="alert alert-success"><div class=row><div class=col-md-3>Total Invested: {{totalInvested | currency}}</div><div class=col-md-3>Amount Left To Invest: {{amountLeftToInvest | currency}}</div><div class=col-md-3>Percent Left To Invest: {{percentLeftToInvest}}%</div><div class=col-md-3>Create Date: {{selectedFund.created | date : format : timezone}}</div></div></div><div class="modal fade" id=investModal tabindex=-1 role=dialog aria-labelledby=myModalLabel aria-hidden=true><div class=modal-dialog><div class=modal-content><div class=modal-header><button type=button class=close data-dismiss=modal aria-hidden=true>&times;</button><h4 class=modal-title>Add Stock to Fund</h4></div><div class=modal-body><form role=form><div class=form-group><label>Symbol</label><input ng-model=stock id=symbolName placeholder="Enter the stock symbol..." typeahead="stock.symbol+ \' - (\' + stock.name + \')\' for stock in getSuggestedStocks($viewValue)" typeahead-on-select=setSelectedStock($item.symbol) class=form-control><p class=help-block>Enter the name of the stock symbol you wish to add to the fund.</p><i ng-show=loadingLocations class="glyphicon glyphicon-refresh"></i><label>Percentage</label><input class=form-control ng-model=stockPercentage><p class=help-block>Enter the percentage of the fund which you would like to allocate to this stock.</p></div></form></div><div class=modal-footer><button type=button class="btn btn-default" data-dismiss=modal>Close</button> <button type=button class="btn btn-primary" ng-click=addStockToFund() data-dismiss=modal>Save changes</button></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div></div><!-- Fund empty, invest button --><div ng-show=!selectedFund.stocks.length><div class="alert alert-danger" ng-show=!selectedFund.stocks.length>This fund is empty. <button class="btn btn-default" type="Click to Invest" data-toggle=modal data-target=#investModal>Invest</button></div></div><!-- End:Fund empty, invest button --><!-- Begin: Tabs --><div ng-show=selectedFund.stocks.length class=tab-container><!-- Nav tabs --><ul class="nav nav-tabs" role=tablist><li role=presentation class=active><a href=#home aria-controls=home role=tab data-toggle=tab>View/Change</a></li><li role=presentation><a href=#profile aria-controls=profile role=tab data-toggle=tab>Transaction History</a></li><li role=presentation><a href=#messages aria-controls=messages role=tab data-toggle=tab>Graph View</a></li><li role=presentation><a href=#settings aria-controls=settings role=tab data-toggle=tab>Return on Investment</a></li><li role=presentation><a href=#settings aria-controls=settings role=tab data-toggle=tab>Investment Selector</a></li></ul><!-- Tab panes --><div class="tab-content tab-container"><div role=tabpanel class="tab-pane active" id=home><div class=row><div class=col-lg-12><div class=panel><div class=panel-body><div class=table-responsive><table class="row-border hover" ng-table=tableParams><tr ng-repeat="stock in selectedFund.stocks"><td data-title="\'Symbol\'" style=width:20%>{{ stock.description }}</td><td data-title="\'% Allocated\'">{{ stock.originalPercentOfFund }}</td><td data-title="\'Total\'">{{ stock.numberOfShares * stock.price | currency }}</td><td data-title="\'Price\'">{{ stock.price | currency }}</td><td data-title="\'# Of Shares\'">{{ stock.numberOfShares }}</td><td data-title="\'Change\'">{{ stock.change }}</td><td data-title="\'Current Price\'">{{ stock.price + 2 | currency }}</td><td><div class=btn-group><button type=button class="btn btn-xs dropdown-toggle" data-toggle=dropdown>Actions <span class=caret></span></button><ul class="dropdown-menu pull-right" role=menu><li><a href=# ng-click=deletestock(stock)>Delete</a></li></ul></div></td></tr></table></div><!-- /.table-responsive --></div><!-- /.panel-body --></div><!-- /.panel --></div></div><div class=row><div class=col-lg-9><button class="btn btn-default pull-left" type="Click to Invest" data-toggle=modal style=margin-left:20px data-target=#investModal><i class="glyphicon glyphicon-plus"></i> Add Additional Stocks</button></div></div></div><div role=tabpanel class=tab-pane id=profile>Transaction History</div><div role=tabpanel class=tab-pane id=messages>...</div><div role=tabpanel class=tab-pane id=settings>...</div></div></div><!-- End: Tabs --></div></div></div><script type=text/ng-template id=myModalContent.html><div class="modal-header">\n        <h3 class="modal-title">Delete fund?</h3>\n      </div>\n      <div class="modal-body">\n        Do you wish to proceed with deleting this fund?\n      </div>\n      <div class="modal-footer">\n        <button class="btn btn-primary" ng-click="ok()">OK</button>\n        <button class="btn btn-warning" ng-click="cancel()">Cancel</button>\n      </div></script><script>/* $(document).ready(function() {\n      $("#symbol").autocomplete({\n        source: function(request, response) {\n          sock.send(request.term);\n          pending.push(response);\n        }\n      });\n    });\n\n    var pending = [];\n    var sock = new SockJS(\'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%3D%22ll%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=\');\n    sock.onmessage = function(e) {\n      var response = pending.shift();\n      response($.parseJSON(e.data));\n    };\n\n*/\n\n\n\n\n\n\n//    $("#symbol").autocomplete({\n//      source: function (request, response) {\n//\n//        var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};\n//\n//        YAHOO.Finance.SymbolSuggest.ssCallback = function (data) {\n//          var mapped = $.map(data.ResultSet.Result, function (e, i) {\n//            return {\n//              label: e.symbol + \' (\' + e.name + \')\',\n//              value: e.symbol\n//            };\n//          });\n//\n//          response(mapped);\n//        };\n//\n//        var url = [\n//          "http://d.yimg.com/autoc.finance.yahoo.com/autoc?",\n//          "query=" + request.term,\n//          "&callback=YAHOO.Finance.SymbolSuggest.ssCallback"];\n//\n//        $.getScript(url.join(""));\n//      },\n//\n//      minLength: 2\n//    });\n\n//    $("#symbol").autocomplete({\n//      source: function (request, response) {\n//\n//        console.log(request);\n//\n//        var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};\n//\n//        YAHOO.Finance.SymbolSuggest.ssCallback = function (data) {\n//\n//          var mapped = $.map(data.ResultSet.Result, function (e, i) {\n//            return {\n//              value: e.symbol + \' (\' + e.name + \')\',\n//              id: e.symbol\n//            };\n//          });\n//          console.log(mapped);\n//\n//          response(mapped);\n//        };\n//\n//        var url = [\n//          "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=" + request.term,\n//          "&callback=YAHOO.Finance.SymbolSuggest.ssCallback"];\n//\n//        $.getScript(url.join(""));\n//\n//      },\n//      minLength: 2\n//    });</script></div><!-- /#page-wrapper -->'),a.put("components/modal/modal.html",'<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'),a.put("components/navbar/navbar.html",'<!-- Navigation --><nav class="navbar navbar-default navbar-static-top" role=navigation style="margin-bottom: 0"><div class=navbar-header style=height:100px><button type=button class=navbar-toggle data-toggle=collapse data-target=.navbar-collapse><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a class=navbar-brand href="/" style=padding:0px><img src=../../../assets/images/ebc310ad.yf.main_hed_lft.logo.png style="height: 100px;width: 400px"></a></div><!-- /.navbar-header --><ul class="nav navbar-top-links navbar-right" ng-controller=NavbarCtrl><li></li><li ng-show=isLoggedIn()><span>Hello {{ getCurrentUser().name }}</span></li><li class=dropdown><a class=dropdown-toggle data-toggle=dropdown href=#><i class="fa fa-envelope fa-fw"></i> <i class="fa fa-caret-down"></i></a><ul class="dropdown-menu dropdown-messages"><li><a href=#><div><strong>John Smith</strong> <span class="pull-right text-muted"><em>Yesterday</em></span></div><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...</div></a></li><li class=divider></li><li><a href=#><div><strong>John Smith</strong> <span class="pull-right text-muted"><em>Yesterday</em></span></div><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...</div></a></li><li class=divider></li><li><a href=#><div><strong>John Smith</strong> <span class="pull-right text-muted"><em>Yesterday</em></span></div><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...</div></a></li><li class=divider></li><li><a class=text-center href=#><strong>Read All Messages</strong> <i class="fa fa-angle-right"></i></a></li></ul><!-- /.dropdown-messages --></li><!-- /.dropdown --><li class=dropdown><a class=dropdown-toggle data-toggle=dropdown href=#><i class="fa fa-tasks fa-fw"></i> <i class="fa fa-caret-down"></i></a><ul class="dropdown-menu dropdown-tasks"><li><a href=#><div><p><strong>Task 1</strong> <span class="pull-right text-muted">40% Complete</span></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role=progressbar aria-valuenow=40 aria-valuemin=0 aria-valuemax=100 style="width: 40%"><span class=sr-only>40% Complete (success)</span></div></div></div></a></li><li class=divider></li><li><a href=#><div><p><strong>Task 2</strong> <span class="pull-right text-muted">20% Complete</span></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-info" role=progressbar aria-valuenow=20 aria-valuemin=0 aria-valuemax=100 style="width: 20%"><span class=sr-only>20% Complete</span></div></div></div></a></li><li class=divider></li><li><a href=#><div><p><strong>Task 3</strong> <span class="pull-right text-muted">60% Complete</span></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-warning" role=progressbar aria-valuenow=60 aria-valuemin=0 aria-valuemax=100 style="width: 60%"><span class=sr-only>60% Complete (warning)</span></div></div></div></a></li><li class=divider></li><li><a href=#><div><p><strong>Task 4</strong> <span class="pull-right text-muted">80% Complete</span></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-danger" role=progressbar aria-valuenow=80 aria-valuemin=0 aria-valuemax=100 style="width: 80%"><span class=sr-only>80% Complete (danger)</span></div></div></div></a></li><li class=divider></li><li><a class=text-center href=#><strong>See All Tasks</strong> <i class="fa fa-angle-right"></i></a></li></ul><!-- /.dropdown-tasks --></li><!-- /.dropdown --><li class=dropdown><a class=dropdown-toggle data-toggle=dropdown href=#><i class="fa fa-bell fa-fw"></i> <i class="fa fa-caret-down"></i></a><ul class="dropdown-menu dropdown-alerts"><li><a href=#><div><i class="fa fa-comment fa-fw"></i> New Comment <span class="pull-right text-muted small">4 minutes ago</span></div></a></li><li class=divider></li><li><a href=#><div><i class="fa fa-twitter fa-fw"></i> 3 New Followers <span class="pull-right text-muted small">12 minutes ago</span></div></a></li><li class=divider></li><li><a href=#><div><i class="fa fa-envelope fa-fw"></i> Message Sent <span class="pull-right text-muted small">4 minutes ago</span></div></a></li><li class=divider></li><li><a href=#><div><i class="fa fa-tasks fa-fw"></i> New Task <span class="pull-right text-muted small">4 minutes ago</span></div></a></li><li class=divider></li><li><a href=#><div><i class="fa fa-upload fa-fw"></i> Server Rebooted <span class="pull-right text-muted small">4 minutes ago</span></div></a></li><li class=divider></li><li><a class=text-center href=#><strong>See All Alerts</strong> <i class="fa fa-angle-right"></i></a></li></ul><!-- /.dropdown-alerts --></li><!-- /.dropdown --><li class=dropdown><a class=dropdown-toggle data-toggle=dropdown href=#><i class="fa fa-user fa-fw"></i> <i class="fa fa-caret-down"></i></a><ul class="dropdown-menu dropdown-user"><li><a href=#><i class="fa fa-user fa-fw"></i> User Profile</a></li><li><a href=/settings><i class="fa fa-gear fa-fw"></i> Settings</a></li><li class=divider></li><li ng-hide=isLoggedIn()><a href=/signp>Register</a></li><li ng-show=isLoggedIn()><a href="" ng-click=logout()>Logout</a></li><li ng-hide=isLoggedIn()><a href=/login>Login</a></li></ul><!-- /.dropdown-user --></li><!-- /.dropdown --></ul><!-- /.navbar-top-links --><div class="navbar-default sidebar" role=navigation><div class="sidebar-nav navbar-collapse"><ul class=nav id=side-menu><li><a ng-href="/" style=color:#999999><i class="glyphicon glyphicon-check fa-fw" style="font-size: 25px"></i> Getting Started</a><!--<ul class="nav nav-second-level">\n            <li>\n              <a href="#">Orientation</a>\n            </li>\n            <li>\n              <a href="#">Risk</a>\n            </li>\n            <li>\n              <a href="#">Goal Setting</a>\n            </li>\n            <li>\n              <a href="#">Pricing</a>\n            </li>\n            <li>\n              <a href="#">Help</a>\n            </li>\n            <li>\n              <a href="#"> About us</a>\n            </li>\n          </ul> --></li><li><a ng-href=/main style=color:#999999><i class="fa fa-line-chart fa-fw" style="font-size: 25px"></i> Manage your fund</a></li><li><a ng-href=/main style=color:#999999><i class="fa fa-wrench fa-fw" style="font-size: 25px"></i> Investment tools</a></li><li><a ng-href=/main style=color:#999999><i class="fa fa-support fa-fw" style="font-size: 25px"></i> Information Exchange</a></li></ul></div><!-- /.sidebar-collapse --></div><!-- /.navbar-static-side --></nav>')
}]);