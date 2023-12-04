<template>
  <main class="Matc MatcArticle">
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-9">
            <div class="content">
              <h1>Privacy Policy</h1>

              <p>
                We operate <b>{{host}}</b>. This page informs you of our
                policies regarding the collection, use and disclosure of
                Personal Information we receive from users of the Site. We use
                your Personal Information only for providing and improving the
                Site. By using the Site, you agree to the collection and use of
                information in accordance with this policy.
              </p>

              <h3>Information Collection And Use</h3>
              <p>
                While using our Site, we may ask you to provide us with certain
                personally identifiable information that can be used to contact
                or identify you. Personal information may include your email,
                your name and optionally your homepage or image. This data is
                used for communication purposes and as part of our sharing
                functionality (To show the names of the collaborators). Please
                note that all data except your email is optional.
              </p>

              <h4>Log Data</h4>
              <p>
                Like many site operators, we collect information that your
                browser sends whenever you visit our Site ("Log Data"). This log
                data may include information such as your browser type, browser
                version, the pages of our Site that you visit, the time and date
                of your visit, the time spent on those pages and other
                statistics. This information is collected with Google Analytics.
              </p>
              <p>
                We also monitor how you are using our system. For instance, we
                store when you login, or when you create a prototype. This data
                is used to ensure the highest security and detect possible
                threads, e.g. if someone is trying to hack an account. The data
                might also be used to further improve the Quality and User
                Experience of our service. Please be assured that we
                <b>do not share</b> this data with any third party.
              </p>
              <p>
                When an error occurs, the system will securly store information
                regarding the error. This information might contain your user
                ID. We will use this data only to improve the product.
              </p>

              <h3>Data Sharing</h3>
              <p>
                We will not share your data with any third party with the
                following exceptions:
              </p>
              <ol>
                <li>
                  <i>Google Fonts:</i>We use Google Fonts to for custom fonts.
                  When you use these fonts, data will be downloaded from Googles
                  servers. This means certain information how you use our
                  website is anonymously shared with Google, e.g. your IP
                  address. Google does not obtain any personal information from
                  us. You can find more information
                   <a target="google" href="https://developers.google.com/fonts/faq/privacy">here</a>.
                </li>
              </ol>
              <p></p>

              <h3>App Data</h3>
              <p>
                The data of your prototypes is stored on our servers as well.
                This data does not contain personal information, unless you add
                this kind of information to your design, e.g. by using a photo
                of yourself. This app data is stored securely on our servers and
                can only be accessed by authorized users, which includes the
                share links. We, therefore, advise you to be careful which kind
                of content you use in your prototypes. <b>{{host}}</b> does not hold
                responsibility for this kind of third-party content.
              </p>
              <p>
                The interaction of your testers is stored on our servers in an
                anonymized form. No IP addresses or personal information is
                stored by default. In case you ask the users to provide personal
                information in the prototypes, for instance, by designing a text
                input field, personal information may be stored in the
                interaction data. <b>{{host}}</b>  does not have access to this data,
                and does not hold responsibility for this data. We advice to
                educate your users to not provide personal information if
                possible.
              </p>

              <h3>Cookies</h3>
              <p>
                Cookies are files with small amount of data, which may include
                an anonymous unique identifier. Cookies are sent to your browser
                from a website and stored on your computer's hard drive. We use
                "cookies" to enable authentification and to debug the
                software. You can instruct your browser to refuse all cookies or
                to indicate when a cookie is being sent. However, if you do not
                accept cookies, you may not be able to use some portions of our
                Site.
              </p>

              <h3>Security</h3>
              <p>
                The security of your Personal Information is important to us
                there for all traffic over the internet is encrypted using state
                of the art technology (SSL). The access to our servers is
                secured over secured protocols.
              </p>

              <h3>Other Services</h3>
              <p>
                <b>{{host}}</b>  allows prototypes to send or load data from external servers. This happends when you run a usability
                test with <b>{{host}}</b>  and the prototype is configured to do so. <b>{{host}}</b>  does not control how this data is processed and
                does not take any responsibility.
              </p>

              <h3>Changes To This Privacy Policy</h3>
              <p>
                This Privacy Policy is effective as of (add date)and will remain
                in effect except with respect to any changes in its provisions
                in the future, which will be in effect immediately after being
                posted on this page. We reserve the right to update or change
                our Privacy Policy at any time and you should check this Privacy
                Policy periodically. Your continued use of the Service after we
                post any modifications to the Privacy Policy on this page will
                constitute your acknowledgment of the modifications and your
                consent to abide and be bound by the modified Privacy Policy. If
                we make any material changes to this Privacy Policy, we will
                notify you either through the email address you have provided
                us, or by placing a prominent notice on our website.
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
  @import url("../style/css/legacy.css");
</style>
<style lang="scss">
  @import "../style/matc.scss";
</style>

<script>
export default {
  name: "Privacy",
  mixins: [],
  computed: {
    host () {
      return location.protocol + '://' + location.host
    }
  },
  mounted() {},
};
</script>
