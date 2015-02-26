using Breeze.WebApi;
using Breeze.WebApi.EF;
using BreezeAngular.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace BreezeAngular.Controllers
{
    [BreezeController]
    public class DataController : ApiController
    {
        readonly EFContextProvider<angulardbEntities> _contextProvider =
            new EFContextProvider<angulardbEntities>();


        [HttpGet]
        public string Metadata()
        {
            return _contextProvider.Metadata();
        }

        [HttpPost]
        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _contextProvider.SaveChanges(saveBundle);
        }

        [HttpGet]
        public IQueryable<person> people()
        {
            return _contextProvider.Context.people;
        }
    }
}
