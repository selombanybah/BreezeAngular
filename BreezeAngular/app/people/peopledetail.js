(function () {
    'use strict';

    var controllerId = 'peopledetail';

    angular.module('app').controller(controllerId,
        ['$scope', '$location', '$window', '$routeParams', 'common', 'config', 'datacontext', 'model', 'helper',
            peopledetail]);

    function peopledetail($scope, $location, $window, $routeParams, common, config, datacontext, model, helper) {
        var vm = this;

        var entityName = model.entityNames.person;

        var logError = common.logger.getLogFn(controllerId, 'error');

        var wipEntityKey = undefined;

        // Bindable properties and functions are placed on vm.
        vm.person = undefined;
        vm.personIdParameter = $routeParams.id;

        vm.goBack = goBack;
        vm.cancel = cancel;

        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;

        vm.title = 'peopledetail';

        vm.activate = activate;

        // vm.canSave Property
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        function canSave() {
            return vm.hasChanges && !vm.isSaving;
        }

        activate();

        function activate() {
            onDestroy();
            onHasChanges();

            common.activateController([getRequestedPerson()], controllerId).then(onEveryChange());
        }

        function getRequestedPerson() {
            var val = $routeParams.id;

            if (val === 'new') {
                vm.person = datacontext.person.create();

                return vm.person;
            }

            return datacontext.person.getById(val)
                .then(function (data) {
                    // Will either get back an entity or an {entity:, key:}
                    wipEntityKey = data.key;

                    vm.person = data.entity || data;
                },
                function (error) {
                    logError('Unable to get person from WIP ' + val);

                    goToPeople();
                });
        }

        function goBack() {
            $window.history.back();
        }

        function cancel() {
            datacontext.cancel();

            removeWipEntity();

            helper.replaceLocationUrlGuidWithId(vm.person.id);

            if (vm.person.entityAspect.entityState.isDetached()) {
                goToPeople();
            }
        }

        function goToPeople() {
            $location.path('/people');
        }

        function save() {
            if (!canSave()) {
                return common.$q.when(null);

            } // Must return a promise

            vm.isSaving = true;

            return datacontext.save()
                .then(function (saveResult) {
                    // Save success
                    vm.isSaving = false;

                    removeWipEntity();

                    helper.replaceLocationUrlGuidWithId(vm.person.id);
                },
                function (error) {
                    // Save error
                    vm.isSaving = false;
                });
        }

        function onDestroy() {
            $scope.$on('$destroy', function () {
                autoStoreWip(true);

                datacontext.cancel();
            });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) {
                    autoStoreWip();

                });
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }

        function storeWipEntity() {
            if (!vm.person) {
                return;
            }

            var description = (vm.person.fullName || '[New person]') + ' ' + vm.person.id;

            var routeState = 'person';

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(vm.person, wipEntityKey, entityName, description, routeState);
        }
    }
})();
