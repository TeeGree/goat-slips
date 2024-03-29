﻿using GoatSlips.Attributes;
using GoatSlips.DAL;
using GoatSlips.Exceptions;
using GoatSlips.Helpers;
using GoatSlips.Models;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Authentication;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IUserService _userService;
        private readonly IUserProjectRepository _userProjectRepository;
        private readonly IJwtUtils _jwtUtils;

        public UserController(
            ILogger<UserController> logger,
            IUserService userService,
            IUserProjectRepository userProjectRepository,
            IJwtUtils jwtUtils
        )
        {
            _logger = logger;
            _userService = userService;
            _userProjectRepository = userProjectRepository;
            _jwtUtils = jwtUtils;
        }

        [HttpGet("QueryUsers/{searchText?}", Name = "QueryUsersForUserManagement")]
        public ActionResult<IEnumerable<UserForManagement>> QueryUsersForUserManagement(string? searchText)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                IEnumerable<UserForManagement> users = _userService.QueryUsers(searchText);
                return Ok(users);
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

        [HttpGet("GetUsersForDropdown", Name = "GetUsersForDropdown")]
        public ActionResult<IEnumerable<UserForDropdown>> GetUsersForDropdown()
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                IEnumerable<UserForDropdown> users = _userService.GetAllUsersForDropdown();
                return Ok(users);
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

        [AllowAnonymous]
        [HttpPost("Authenticate", Name = "Authenticate")]
        public IActionResult Authenticate([FromBody] AuthenticateBody authenticateBody)
        {
            try
            {
                _userService.Authenticate(authenticateBody, HttpContext);
                return Ok();
            }
            catch (InvalidCredentialException e)
            {
                return BadRequest(e.Message);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [AllowAnonymous]
        [HttpGet("GetUser", Name = "GetUser")]
        public ActionResult<UserForUI?> GetUser()
        {
            try
            {
                UserForUI? username = _userService.GetUserFromContext(HttpContext);
                return Ok(username);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [AllowAnonymous]
        [HttpGet("AnyUsers", Name = "AnyUsers")]
        public ActionResult<bool> AnyUsers()
        {
            try
            {
                bool anyUsers = _userService.AnyUsers();
                return Ok(anyUsers);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("CreateUser", Name = "CreateUser")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserBody createUserBody)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                await _userService.CreateUser(createUserBody, true);
                return Ok();
            }
            catch (ArgumentNullException e)
            {
                return BadRequest(e.Message);
            }
            catch (InvalidCredentialException e)
            {
                return BadRequest(e.Message);
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

        [AllowAnonymous]
        [HttpPost("CreateFirstUser", Name = "CreateFirstUser")]
        public async Task<IActionResult> CreateFirstUser([FromBody] CreateUserBody createUserBody)
        {
            try
            {
                int userId = await _userService.CreateUser(createUserBody, false);
                _userService.AddAdminAccessRightForUser(userId);
                return Ok();
            }
            catch(InvalidOperationException e)
            {
                return BadRequest(e.Message);
            }
            catch (ArgumentNullException e)
            {
                return BadRequest(e.Message);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("Logout", Name = "Logout")]
        public IActionResult Logout()
        {
            try
            {
                _userService.Logout(HttpContext);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("ChangePassword", Name = "ChangePassword")]
        public IActionResult ChangePassword([FromBody] ChangePasswordBody changePasswordBody)
        {
            try
            {
                _userService.ChangePassword(changePasswordBody, HttpContext);
                return Ok();
            }
            catch (InvalidCredentialException e)
            {
                return BadRequest(e.Message);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("AccessRights/{userId}", Name = "GetAccessRightsForUser")]
        public ActionResult<IEnumerable<AccessRight>> GetAccessRightsForUser(int userId)
        {
            try
            {
                IEnumerable<AccessRight> accessRights = _userService.GetAccessRightsForUser(userId);
                return Ok(accessRights);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("ProjectsForUser", Name = "GetUserProjects")]
        public ActionResult<IEnumerable<UserProject>> GetUserProjects()
        {
            try
            {
                int? userId = _jwtUtils.GetUserIdFromContext(HttpContext);

                if (userId == null)
                {
                    throw new Exception("No user in context.");
                }

                IEnumerable<UserProject> userProjects = _userProjectRepository.GetUserProjects(userId);
                return Ok(userProjects);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("Projects", Name = "GetAllUserProjects")]
        public ActionResult<IEnumerable<UserProject>> GetAllUserProjects()
        {
            try
            {
                IEnumerable<UserProject> userProjects = _userProjectRepository.GetUserProjects();
                return Ok(userProjects);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("SetProjectsForUser", Name = "SetProjectsForUser")]
        public IActionResult SetProjectsForUser(SetUserProjectsBody body)
        {
            try
            {
                _userProjectRepository.SetUserProjects(body.UserId, body.ProjectIds);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("SetAccessRights", Name = "SetAccessRights")]
        public IActionResult SetAccessRights(SetAccessRightsBody body)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                _userService.SetUserAccessRights(body.UserId, body.AccessRightIds);
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

        [HttpGet("GenerateApiKey", Name = "GenerateApiKey")]
        public ActionResult<Guid> GenerateApiKey()
        {
            try
            {
                Guid apiKey = _userService.GenerateApiKey(HttpContext);
                return Ok(apiKey);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}