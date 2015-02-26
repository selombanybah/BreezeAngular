(function()
{
    'use strict';

    var serviceId = 'repository.person';

    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', RepositoryPerson]);

    function RepositoryPerson(model, AbstractRepository, zStorage)
    {
        var entityName = model.entityNames.person;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'firstName, lastName';
        var Predicate = breeze.Predicate;

        function Ctor(mgr)
        {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            // Exposed data access functions
            this.getAll = getAll;
            this.getCount = getCount;
            this.getFilteredCount = getFilteredCount;
            this.zStorage = zStorage;
            this.getById = getById;
            this.create = create;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function create() {
            return this.manager.createEntity(entityName);
        }

        // Formerly known as datacontext.getpeople()
        function getAll(forceRemote, page, size, nameFilter)
        {
            var self = this;
            // Only return a page worth of people
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            if(self.zStorage.areItemsLoaded('people') && !forceRemote)
            {
                // Get the page of people from local cache
                return self.$q.when(getByPage());
            }

            // Load all people to cache via remote query
            return EntityQuery.from('people')
                .select('id, firstName, lastName, location')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data)
            {
                var people = self._setIsPartialTrue(data.results);

                self.zStorage.areItemsLoaded('people', true);

                self.zStorage.save();

                self.log('Retrieved [People] from remote data source', people.length, true);

                return getByPage();
            }

            function getByPage()
            {
                var predicate = null;

                if(nameFilter)
                {
                    predicate = _fullNamePredicate(nameFilter);
                }

                var people = EntityQuery.from('people')
                    .where(predicate)
                    .orderBy(orderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return people;
            }
        }

        // Formerly known as datacontext.getAttendeeCount()
        function getCount()
        {
            var self = this;

            if(self.zStorage.areItemsLoaded('people'))
            {
                return self.$q.when(self._getLocalEntityCount(entityName));
            }

            // people aren't loaded; ask the server for a count.
            return EntityQuery.from('people').take(0).inlineCount()
                .using(self.manager).execute()
                .then(self._getInlineCount);
        }

        // Formerly known as datacontext.getFilteredCount()
        function getFilteredCount(nameFilter)
        {
            var predicate = _fullNamePredicate(nameFilter);

            var people = EntityQuery.from(entityName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return people.length;
        }

        function _fullNamePredicate(filterValue)
        {
            return Predicate
                .create('firstName', 'contains', filterValue)
                .or('lastName', 'contains', filterValue);
        }
    }
})();