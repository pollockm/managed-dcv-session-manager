# coding: utf-8

# flake8: noqa

"""
    DCV Session Manager

    DCV Session Manager API  # noqa: E501

    OpenAPI spec version: 2020.2
    
    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

from __future__ import absolute_import

# import apis into sdk package
from swagger_client.api.get_session_connection_data_api import GetSessionConnectionDataApi
from swagger_client.api.session_permissions_api import SessionPermissionsApi
from swagger_client.api.sessions_api import SessionsApi
# import ApiClient
from swagger_client.api_client import ApiClient
from swagger_client.configuration import Configuration
# import models into sdk package
from swagger_client.models.create_session_request_data import CreateSessionRequestData
from swagger_client.models.create_sessions_response import CreateSessionsResponse
from swagger_client.models.delete_session_request_data import DeleteSessionRequestData
from swagger_client.models.delete_session_successful_response import DeleteSessionSuccessfulResponse
from swagger_client.models.delete_session_unsuccessful_response import DeleteSessionUnsuccessfulResponse
from swagger_client.models.delete_sessions_response import DeleteSessionsResponse
from swagger_client.models.describe_sessions_request_data import DescribeSessionsRequestData
from swagger_client.models.describe_sessions_response import DescribeSessionsResponse
from swagger_client.models.get_session_connection_data_response import GetSessionConnectionDataResponse
from swagger_client.models.key_value_pair import KeyValuePair
from swagger_client.models.server import Server
from swagger_client.models.session import Session
from swagger_client.models.unsuccessful_create_session_request_data import UnsuccessfulCreateSessionRequestData
from swagger_client.models.update_session_permissions_request_data import UpdateSessionPermissionsRequestData
from swagger_client.models.update_session_permissions_response import UpdateSessionPermissionsResponse
from swagger_client.models.update_session_permissions_successful_response import UpdateSessionPermissionsSuccessfulResponse
from swagger_client.models.update_session_permissions_unsuccessful_response import UpdateSessionPermissionsUnsuccessfulResponse