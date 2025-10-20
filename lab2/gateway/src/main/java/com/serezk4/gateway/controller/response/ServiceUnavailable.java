package com.serezk4.gateway.controller.response;

public class ServiceUnavailable {
    String serviceName;
    String status = "Service is currently unavailable.";

    public ServiceUnavailable(String serviceName, String status) {
        this.serviceName = serviceName;
        this.status = status;
    }

    public ServiceUnavailable(String serviceName) {
        this.serviceName = serviceName;
    }

    public ServiceUnavailable() {
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @java.lang.Override
    public java.lang.String toString() {
        return "ServiceUnavailable{" +
                "serviceName='" + serviceName + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
