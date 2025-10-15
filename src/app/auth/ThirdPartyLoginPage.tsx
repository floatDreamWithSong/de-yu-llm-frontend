import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { RequestThirdPartyLogin } from "@/apis/requests/user/third-party";
import { useEffect } from "react";
import { LinkButton } from "@/components/ui/button";
import { tokenStore } from "@/lib/request";

const ThirdPartyLoginPage = () => {
  const searchParams = useSearch({ from: "/auth/thirdparty-login" });
  const thirdpartyLoginMutation = useMutation({
    mutationFn: RequestThirdPartyLogin,
  });
  const mutate = thirdpartyLoginMutation.mutate;
  const navigate = useNavigate();
  useEffect(() => {
    if (searchParams.ticket && searchParams.thirdparty) {
      mutate(
        {
          ticket: searchParams.ticket,
          thirdparty: searchParams.thirdparty,
        },
        {
          onSuccess(data) {
            tokenStore.set(data.token);
            setTimeout(() => {
              navigate({
                to: "/chat",
              });
            }, 1000);
          },
        },
      );
    }
  }, [searchParams, mutate, navigate]);
  return (
    <div>
      {thirdpartyLoginMutation.isPending && <div>验证中...</div>}
      {thirdpartyLoginMutation.isError && (
        <div>
          <span>验证失败</span>
          <LinkButton
            variant={"link"}
            to="/auth/login"
            search={{ redirect: "/chat" }}
          >
            返回登录
          </LinkButton>
        </div>
      )}
      {thirdpartyLoginMutation.isSuccess && (
        <div>
          验证成功，正在
          <Link to="/chat" preload="render">
            跳转页面
          </Link>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyLoginPage;
