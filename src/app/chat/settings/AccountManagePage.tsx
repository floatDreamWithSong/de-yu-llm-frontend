import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  Brain,
  EyeClosedIcon,
  EyeIcon,
  Lock,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setPassword } from "@/apis/requests/user/set-password";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  passwordSchema,
  UserProfileSchemaPartial,
} from "@/apis/requests/user/schema";
import { checkCode } from "@/apis/requests/user/check-code";
import { mobileSchema } from "@/utils/schemas";
import { sendVerificationCode } from "@/apis/requests/user/code";
import { useRef, useState } from "react";
import { getProfile, updateProfile, type RoleType } from "@/apis/requests/user/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadCosFile } from "@/apis/requests/cos";
import ClientQueryKeys from "@/apis/queryKeys";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COTEA_ENUM } from "@/apis/requests/conversation/enums/cotea";
import { Loader } from "@/components/ai-elements/loader";

export default function AccountManagePage() {
  const router = useRouter();
  return (
    <div className="max-w-[800px] mx-auto px-12 my-12 pb-12">
      <nav className="flex items-center justify-center gap-2 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0"
          onClick={() => router.history.back()}
        >
          <ArrowLeftIcon />
        </Button>
        <h2 className="text-xl font-bold">账户管理</h2>
      </nav>
      <Accordion
        type="multiple"
        className="w-full mt-8 px-4"
        defaultValue={["item-0", "item-1", "item-2"]}
      >
        <AccordionItem value="item-0">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Brain className="size-4" />
              记忆
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance pl-4">
            <MemorySettingForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Lock className="size-4" />
              更改密码
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance pl-4">
            <ResetPasswordForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <User className="size-4" />
              用户资料
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance pl-4">
            <UserInfoForm />
            <UserProfile />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Trash2 className="size-4" />
              注销账号
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance pl-4">
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>账号注销后无法找回</AlertTitle>
            </Alert>
            <div>
              <AlertDialog>
                <Button variant="destructive" asChild>
                  <AlertDialogTrigger>确认注销</AlertDialogTrigger>
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认注销</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription>
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>账号注销后无法找回</AlertTitle>
                    </Alert>
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <Button variant="destructive" asChild>
                      <AlertDialogAction>确认</AlertDialogAction>
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const MemorySettingForm = () => {
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(
    (localStorage.getItem("isMemoryEnabled") ?? "true") === "true",
  );
  return (
    <div className="flex items-center gap-2 justify-between">
      允许助手在回复时参考并使用您保存的记忆
      <Switch
        checked={isMemoryEnabled}
        onCheckedChange={(checked) => {
          setIsMemoryEnabled(checked);
          localStorage.setItem("isMemoryEnabled", checked ? "true" : "false");
        }}
      />
    </div>
  );
};

const formSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });
const checkCodeSchema = z.object({
  phone: mobileSchema,
  code: z.string(),
});
const ResetPasswordForm = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const countDownRef = useRef<NodeJS.Timeout | null>(null);
  const [countDown, setCountDown] = useState(0);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const codeForm = useForm<z.infer<typeof checkCodeSchema>>({
    resolver: zodResolver(checkCodeSchema),
    defaultValues: {
      code: "",
      phone: "",
    },
  });
  const checkCodeMutation = useMutation({
    mutationFn: checkCode,
    onSuccess: () => {
      toast.success("验证码验证成功");
      setIsVerified(true);
    },
    onError: () => {
      toast.error("验证码验证失败");
    },
  });
  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: () => {
      toast.success("验证码发送成功");
      setCountDown(60);
      countDownRef.current = setInterval(() => {
        setCountDown((prev) => {
          if (prev <= 0 && countDownRef.current) {
            clearInterval(countDownRef.current as NodeJS.Timeout);
            countDownRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: () => {
      toast.error("验证码发送失败");
    },
  });
  const resetPasswordMutation = useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      toast.success("密码更改成功");
    },
    onError: () => {
      toast.error("密码更改失败");
    },
  });
  const handleResetPassword = (newPassword: string) => {
    if (!isVerified) {
      toast.error("请填写手机验证码！");
      return;
    }
    resetPasswordMutation.mutate({ newPassword });
  };
  return (
    <>
      <Form {...codeForm}>
        <form
          className="space-y-4"
          onSubmit={codeForm.handleSubmit((data) =>
            checkCodeMutation.mutate({
              authId: "",
              authType: "phone-verify",
              cause: "password",
              verify: data.code,
            }),
          )}
        >
          <FormField
            control={codeForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>手机号</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入手机号"
                    className="max-w-[300px]"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            disabled={countDown > 0}
            onClick={() =>
              sendCodeMutation.mutate({
                authId: codeForm.getValues().phone,
                authType: "phone-verify",
                cause: "password",
              })
            }
          >
            {countDown > 0 ? `${countDown}s` : "获取验证码"}
          </Button>
          <FormField
            control={codeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>验证码</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入验证码"
                    className="max-w-[300px]"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">校验验证码</Button>
        </form>
      </Form>
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((data) =>
            handleResetPassword(data.newPassword),
          )}
        >
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新密码</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入新密码"
                    className="max-w-[300px]"
                    type={isPasswordVisible ? "text" : "password"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请确认新密码"
                    className="max-w-[300px]"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {!isPasswordVisible ? "显示密码" : "隐藏密码"}
              {!isPasswordVisible ? <EyeIcon /> : <EyeClosedIcon />}
            </Button>
            <Button disabled={!isVerified} type="submit">
              确认更改
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

const UserInfoForm = () => {
  const userInfo = useQuery({
    queryKey: [ClientQueryKeys.user.profile],
    queryFn: getProfile,
  });

  if (!userInfo.data) {
    return null;
  }

  return (
    <UserInfoFormContent
      key={userInfo.data.username}
      initialData={{
        username: userInfo.data.username,
        avatar: userInfo.data.avatar,
      }}
    />
  );
};

const UserInfoFormContent = ({
  initialData,
}: {
  initialData: {
    username?: string;
    avatar?: string;
  };
}) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof UserProfileSchemaPartial>>({
    resolver: zodResolver(UserProfileSchemaPartial),
    defaultValues: initialData,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadCosFile,
    onSuccess: (data) => {
      form.setValue("avatar", data.url);
      toast.success("头像上传成功");
    },
    onError: () => {
      toast.error("头像上传失败");
    },
  });
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("用户资料更新成功");
      queryClient.invalidateQueries({
        queryKey: [ClientQueryKeys.user.profile],
      });
    },
    onError: () => {
      toast.error("用户资料更新失败");
    },
  });
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 获取文件扩展名
    let suffix = file.name.split(".").pop();
    if (!suffix) {
      toast.error("文件格式不支持");
      return;
    }
    suffix = `.${suffix}`;
    console.log(suffix);
    uploadAvatarMutation.mutate({
      prefix: "avatar",
      suffix: suffix,
      file: file,
    });
  };

  const handleSubmit = (data: z.infer<typeof UserProfileSchemaPartial>) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入用户名"
                    className="max-w-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>头像</FormLabel>
                <Avatar className="mb-2">
                  <AvatarImage src={field.value} />
                  <AvatarFallback>
                    {form.getValues("username")?.slice(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    placeholder="请上传头像"
                    className="max-w-[300px]"
                    onChange={handleFileChange}
                    disabled={uploadAvatarMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={
              updateProfileMutation.isPending || uploadAvatarMutation.isPending
            }
          >
            {updateProfileMutation.isPending ? "提交中..." : "确认更改"}
          </Button>
        </form>
      </Form>
    </>
  );
};


// 构建 role 字符串（用于提交到服务器）
const buildRole = (
  roleType: RoleType,
  grade: string | null,
  subject: string | null,
): string | null => {
  if (!roleType || !grade) return null;

  switch (roleType) {
    case COTEA_ENUM.UserProfileRoleEnum.keys[0]:
      return `${grade} ${COTEA_ENUM.UserProfileRoleEnum.STUDENT}`;
    case COTEA_ENUM.UserProfileRoleEnum.keys[1]:
      return subject ? `${grade} ${subject} ${COTEA_ENUM.UserProfileRoleEnum.TEACHER}` : null;
    case COTEA_ENUM.UserProfileRoleEnum.keys[2]:
      return `${grade} ${COTEA_ENUM.UserProfileRoleEnum.PARENT}`;
    default:
      return null;
  }
};

const UserProfile = () => {
  const userInfo = useQuery({
    queryKey: [ClientQueryKeys.user.profile],
    queryFn: getProfile,
  });

  // 使用 key 让组件在数据变化时重新挂载，确保初始状态正确
  if (!userInfo.data) {
    return null;
  }

  return (
    <UserProfileForm
      key={`${userInfo.data.profile?.roleType}-${userInfo.data.profile?.grade}-${userInfo.data.profile?.subject}`}
      initialProfile={userInfo.data.profile}
    />
  );
};

const UserProfileForm = ({
  initialProfile,
}: {
  initialProfile: {
    roleType: RoleType;
    grade: string | null;
    subject: string | null;
  };
}) => {
  const queryClient = useQueryClient();

  const [roleType, setRoleType] = useState<RoleType>(initialProfile.roleType);
  const [grade, setGrade] = useState<string | null>(initialProfile.grade);
  const [subject, setSubject] = useState<string | null>(initialProfile.subject);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("身份信息更新成功");
      queryClient.invalidateQueries({
        queryKey: [ClientQueryKeys.user.profile],
      });
    },
    onError: () => {
      toast.error("身份信息更新失败");
    },
  });

  const handleRoleTypeChange = (value: RoleType) => {
    setRoleType(value);
    // 切换角色时重置选项
    setGrade(null);
    setSubject(null);
  };

  const handleSubmit = () => {
    const role = buildRole(roleType, grade, subject);
    if (!role) {
      toast.error("请完整填写身份信息");
      return;
    }
    updateProfileMutation.mutate({
      profile: { role },
    });
  };

  // 判断是否可以提交
  const canSubmit = () => {
    if (!roleType || !grade) return false;
    if (roleType === COTEA_ENUM.UserProfileRoleEnum.keys[1] && !subject) return false;
    return true;
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={roleType ?? ""}
        onValueChange={(v) => handleRoleTypeChange(v as RoleType)}
        className="space-y-3"
      >
        {/* 学生选项 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value={COTEA_ENUM.UserProfileRoleEnum.keys[0]} id="role-student" />
            <Label htmlFor="role-student" className="cursor-pointer">
              我是学生
            </Label>
          </div>
          {roleType === COTEA_ENUM.UserProfileRoleEnum.keys[0] && (
            <Select value={grade ?? ""} onValueChange={setGrade}>
              <SelectTrigger className="w-[140px]" icon={null}>
                <SelectValue placeholder="选择年级" />
              </SelectTrigger>
              <SelectContent>
                {COTEA_ENUM.GradeEnum.keys.map((key) => (
                  <SelectItem key={key} value={COTEA_ENUM.GradeEnum[key]}>
                    {COTEA_ENUM.GradeEnum[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 教师选项 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value={COTEA_ENUM.UserProfileRoleEnum.keys[1]} id="role-teacher" />
            <Label htmlFor="role-teacher" className="cursor-pointer">
              我是教师
            </Label>
          </div>
          {roleType === COTEA_ENUM.UserProfileRoleEnum.keys[1] && (
            <>
              <Select value={grade ?? ""} onValueChange={setGrade}>
                <SelectTrigger className="w-[140px]" icon={null}>
                  <SelectValue placeholder="选择年级" />
                </SelectTrigger>
                <SelectContent>
                  {COTEA_ENUM.GradeEnum.keys.map((key) => (
                    <SelectItem key={key} value={COTEA_ENUM.GradeEnum[key]}>
                      {COTEA_ENUM.GradeEnum[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subject ?? ""} onValueChange={setSubject}>
                <SelectTrigger className="w-[140px]" icon={null}>
                  <SelectValue placeholder="选择学科" />
                </SelectTrigger>
                <SelectContent>
                  {COTEA_ENUM.SubjectEnum.keys.map((key) => (
                    <SelectItem key={key} value={COTEA_ENUM.SubjectEnum[key]}>
                      {COTEA_ENUM.SubjectEnum[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* 家长选项 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value={COTEA_ENUM.UserProfileRoleEnum.keys[2]} id="role-parent" />
            <Label htmlFor="role-parent" className="cursor-pointer">
              我是家长
            </Label>
          </div>
          {roleType === COTEA_ENUM.UserProfileRoleEnum.keys[2] && (
            <Select value={grade ?? ""} onValueChange={setGrade}>
              <SelectTrigger className="w-[140px]" icon={null}>
                <SelectValue placeholder="选择年级" />
              </SelectTrigger>
              <SelectContent>
                {COTEA_ENUM.GradeEnum.keys.map((key) => (
                  <SelectItem key={key} value={COTEA_ENUM.GradeEnum[key]}>
                    {COTEA_ENUM.GradeEnum[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </RadioGroup>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit() || updateProfileMutation.isPending}
      >
        {updateProfileMutation.isPending ? <Loader /> : "保存身份信息"}
      </Button>
    </div>
  );
};
