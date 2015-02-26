(function () {
    'use strict';
    var controllerId = 'people';
    angular.module('app').controller(controllerId,
         ['$location', 'common', 'config', 'datacontext', people]);

    function people($location, common, config, datacontext) {
        // Using 'Controller As' syntax, so we assign this to the vm variable (for viewmodel).
        var vm = this;
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        // Bindable properties and functions are placed on vm.
        vm.filteredPeople = [];
        vm.refresh = refresh;
        vm.search = search;
        vm.peopleSearch = '';
        vm.goToPerson = goToPerson;
        vm.people = [];
        vm.title = 'People';

        activate();

        function activate() {
            common.activateController([getPeople()], controllerId)
                .then(function () { log('Activated People View'); });
        }

        function getPeople(forceRefresh) {
            return datacontext.person.getAll(forceRefresh)
                .then(function (data) {
                    vm.people = data;
                    applyFilter();
                    return vm.people;
                });
        }

        function refresh() { getPeople(true); }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.peopleSearch = '';
            }
            applyFilter();
        }

        function applyFilter() {
            vm.filteredPeople = vm.people.filter(peopleFilter);
        }

        function peopleFilter(person) {
            var isMatch = vm.peopleSearch
                ? common.textContains(person.fullName, vm.peopleSearch)
                : true;
            return isMatch;
        }

        function goToPerson(person) {
            if (person && person.id) {
                $location.path('/people/' + person.id);
            }
        }
    }
})();
