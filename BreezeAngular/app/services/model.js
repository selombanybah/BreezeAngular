(function()
{
    'use strict';

    var serviceId = 'model';

    angular.module('app').factory(serviceId, ['model.validation', model]);

    function model(modelValidation)
    {
        var entityNames = {
            person: 'person'
        }

        var nulloDate = new Date(1900, 0, 1);

        // Define the functions and properties to reveal.
        var service = {
            configureMetadataStore: configureMetadataStore,
            entityNames: entityNames,
            extendMetadata: extendMetadata
        };

        return service;

        function configureMetadataStore(metadataStore)
        {
            registerPerson(metadataStore);

            modelValidation.createAndRegister(entityNames);
        }

        function extendMetadata(metadataStore)
        {
            modelValidation.applyValidators(metadataStore);
        }

        
        //#region Internal Methods        

        function registerPerson(metadataStore)
        {
            metadataStore.registerEntityTypeCtor('person', Person);

            function Person()
            {
                this.isPartial = false;
            };

            Object.defineProperty(Person.prototype, 'fullName', {
                get: function()
                {
                    var fn = this.firstName;
                    var ln = this.lastName;

                    return ln ? fn + ' ' + ln : fn;
                }
            });
        }        

        
        //#endregion
    }
})();