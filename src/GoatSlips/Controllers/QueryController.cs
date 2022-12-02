using GoatSlips.Attributes;
using GoatSlips.Exceptions;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class QueryController : ControllerBase
    {
        private readonly ILogger<QueryController> _logger;
        private readonly IQueryService _queryService;

        public QueryController(
            ILogger<QueryController> logger,
            IQueryService queryService
        )
        {
            _logger = logger;
            _queryService = queryService;
        }

        [HttpGet(Name = "GetQueries")]
        public ActionResult<IEnumerable<Query>> Get()
        {
            try
            {
                IEnumerable<Query> queries = _queryService.GetQueries(HttpContext);
                return Ok(queries);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("QueryTimeSlips", Name = "QueryTimeSlips")]
        public ActionResult<TimeSlip[]> QueryTimeSlips(GetTimeSlipsBody getTimeSlipsBody)
        {
            try
            {
                TimeSlip[] timeSlips = _queryService.QueryTimeSlips(getTimeSlipsBody, HttpContext);
                return Ok(timeSlips);
            }
            catch (InsufficientAccessException e)
            {
                return Problem(e.Message, statusCode: InsufficientAccessException.StatusCode);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("AddQuery", Name = "AddQuery")]
        public IActionResult AddQuery(AddQueryBody addQueryBody)
        {
            try
            {
                _queryService.AddQuery(
                    addQueryBody.Name,
                    addQueryBody.UserId,
                    addQueryBody.ProjectId,
                    addQueryBody.TaskId,
                    addQueryBody.LaborCodeId,
                    addQueryBody.FromDate,
                    addQueryBody.ToDate,
                    HttpContext);
                return Ok();
            }
            catch (InsufficientAccessException e)
            {
                return Problem(e.Message, statusCode: InsufficientAccessException.StatusCode);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("UpdateQuery", Name = "UpdateQuery")]
        public IActionResult UpdateQuery(UpdateQueryBody updateQueryBody)
        {
            try
            {
                _queryService.UpdateQuery(
                    updateQueryBody.QueryId,
                    updateQueryBody.UserId,
                    updateQueryBody.ProjectId,
                    updateQueryBody.TaskId,
                    updateQueryBody.LaborCodeId,
                    updateQueryBody.FromDate,
                    updateQueryBody.ToDate,
                    HttpContext);
                return Ok();
            }
            catch (InsufficientAccessException e)
            {
                return Problem(e.Message, statusCode: InsufficientAccessException.StatusCode);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpDelete("Delete/{id}", Name = "DeleteQuery")]
        public IActionResult DeleteQuery(int id)
        {
            try
            {
                _queryService.DeleteQuery(id, HttpContext);
                return Ok();
            }
            catch (InsufficientAccessException e)
            {
                return Problem(e.Message, statusCode: InsufficientAccessException.StatusCode);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}
